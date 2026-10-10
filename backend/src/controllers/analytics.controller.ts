import { Request, Response } from 'express';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
// Import Article model for asynchronous view counter updating
import { Article } from '../models/Article.js';

// Record an anonymous public website page-view event
export const recordEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, type, path, sessionId, visitorId, referrerHost } = req.body;

    // Validate presence of required event identifiers
    if (!eventId || typeof eventId !== 'string' || eventId.trim().length === 0) {
      res.status(400).json({ message: 'Valid eventId is required.' });
      return;
    }

    // Only page_view event types are allowed
    if (type !== 'page_view') {
      res.status(400).json({ message: 'Only page_view events are currently accepted.' });
      return;
    }

    // Validate path presence and reject private admin paths
    if (!path || typeof path !== 'string' || !path.startsWith('/') || path.startsWith('/admin')) {
      res.status(400).json({ message: 'A valid public path starting with / is required.' });
      return;
    }

    // Validate session identifier
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      res.status(400).json({ message: 'A valid sessionId is required.' });
      return;
    }

    // Sanitize path and cap length
    const cleanPath = path.trim().substring(0, 200);

    // Derive article slug if browsing a specific article
    let articleId: string | undefined = undefined;
    if (cleanPath.startsWith('/articles/')) {
      const parts = cleanPath.replace(/^\/articles\//, '').split('/');
      if (parts[0]) {
        articleId = parts[0].trim().toLowerCase();
      }
    }

    // Sanitize optional referrer host without paths or protocol
    let cleanReferrerHost = 'direct';
    if (referrerHost && typeof referrerHost === 'string' && referrerHost.trim().length > 0) {
      try {
        const raw = referrerHost.trim().toLowerCase();
        // Extract host name if full URL was provided
        cleanReferrerHost = raw.includes('://') ? new URL(raw).hostname : raw.split('/')[0];
        cleanReferrerHost = cleanReferrerHost.substring(0, 100);
      } catch {
        cleanReferrerHost = 'direct';
      }
    }

    // Sanitize optional visitor identifier
    const cleanVisitorId = visitorId && typeof visitorId === 'string' ? visitorId.trim().substring(0, 100) : undefined;

    // Perform idempotent event upsert using unique eventId
    await AnalyticsEvent.updateOne(
      { eventId: eventId.trim() },
      {
        $setOnInsert: {
          eventId: eventId.trim(),
          type: 'page_view',
          path: cleanPath,
          articleId,
          sessionId: sessionId.trim(),
          visitorId: cleanVisitorId,
          referrerHost: cleanReferrerHost,
          occurredAt: new Date()
        }
      },
      { upsert: true }
    );

    // Asynchronously increment Article.views counter exactly once per article view event
    if (articleId) {
      Article.updateOne({ slug: articleId }, { $inc: { views: 1 } }).catch((err) => {
        console.debug('Failed to increment article views counter:', err);
      });
    }

    res.status(201).json({ success: true });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to record analytics event.', error: err.message });
  }
};

// Generate comprehensive aggregated analytics report for admin review
export const getReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const limitQuery = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
    const limit = Math.min(Math.max(isNaN(limitQuery) ? 10 : limitQuery, 1), 50);

    // Determine query date bounds, defaulting to the last 30 days
    const now = new Date();
    const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0, 0));
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const fromDate = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
    const toDate = req.query.to ? new Date(String(req.query.to)) : defaultTo;

    // Validate parsed date objects
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      res.status(400).json({ message: 'Invalid from or to date parameter.' });
      return;
    }

    // Ensure start date does not succeed end date
    if (fromDate > toDate) {
      res.status(400).json({ message: 'from date must be prior to or equal to to date.' });
      return;
    }

    // Enforce maximum 90-day retention query limit
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000 + 86400000;
    if (toDate.getTime() - fromDate.getTime() > ninetyDaysMs) {
      res.status(400).json({ message: 'Reporting range cannot exceed the 90-day retention window.' });
      return;
    }

    const matchFilter = {
      occurredAt: { $gte: fromDate, $lte: toDate }
    };

    // Parallel MongoDB aggregation pipelines
    const [overviewAgg, dailyAgg, popularPagesAgg, popularArticlesAgg, referrersAgg] = await Promise.all([
      // Aggregation 1: Summary totals (total page views, unique sessions, unique visitor IDs)
      AnalyticsEvent.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            pageViews: { $sum: 1 },
            sessions: { $addToSet: '$sessionId' },
            visitors: {
              $addToSet: {
                $cond: [{ $ifNull: ['$visitorId', false] }, '$visitorId', '$$REMOVE']
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            pageViews: 1,
            visits: { $size: '$sessions' },
            uniqueVisitors: { $size: '$visitors' }
          }
        }
      ]),

      // Aggregation 2: Daily traffic groupings in UTC
      AnalyticsEvent.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$occurredAt', timezone: 'UTC' }
            },
            pageViews: { $sum: 1 },
            sessions: { $addToSet: '$sessionId' }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            pageViews: 1,
            visits: { $size: '$sessions' }
          }
        },
        { $sort: { date: 1 } }
      ]),

      // Aggregation 3: Popular pages ranked by view count
      AnalyticsEvent.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$path',
            views: { $sum: 1 }
          }
        },
        { $project: { _id: 0, path: '$_id', views: 1 } },
        { $sort: { views: -1 } },
        { $limit: limit }
      ]),

      // Aggregation 4: Popular published articles ranked by view count
      AnalyticsEvent.aggregate([
        {
          $match: {
            ...matchFilter,
            articleId: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$articleId',
            views: { $sum: 1 }
          }
        },
        { $project: { _id: 0, slug: '$_id', views: 1 } },
        { $sort: { views: -1 } },
        { $limit: limit }
      ]),

      // Aggregation 5: Referring domains and direct traffic totals
      AnalyticsEvent.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: { $ifNull: ['$referrerHost', 'direct'] },
            visits: { $sum: 1 }
          }
        },
        { $project: { _id: 0, source: '$_id', visits: 1 } },
        { $sort: { visits: -1 } },
        { $limit: limit }
      ])
    ]);

    // Format summary numbers
    const summary = overviewAgg[0] || {
      pageViews: 0,
      visits: 0,
      uniqueVisitors: 0
    };

    // Construct map of existing aggregated daily statistics
    const dailyMap = new Map<string, { pageViews: number; visits: number }>();
    for (const d of dailyAgg) {
      dailyMap.set(d.date, { pageViews: d.pageViews, visits: d.visits });
    }

    // Build contiguous zero-filled daily date range
    const dailyTraffic: Array<{ date: string; pageViews: number; visits: number }> = [];
    const cur = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate()));
    const end = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate()));

    while (cur <= end) {
      const dateStr = cur.toISOString().split('T')[0];
      const existing = dailyMap.get(dateStr);
      dailyTraffic.push({
        date: dateStr,
        pageViews: existing ? existing.pageViews : 0,
        visits: existing ? existing.visits : 0
      });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    res.status(200).json({
      summary,
      dailyTraffic,
      popularPages: popularPagesAgg,
      popularArticles: popularArticlesAgg,
      trafficSources: referrersAgg,
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      },
      retentionDays: 90
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to generate analytics report.', error: err.message });
  }
};

// Retrieve total page views, visits, and unique visitors summary
export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0, 0));
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const fromDate = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
    const toDate = req.query.to ? new Date(String(req.query.to)) : defaultTo;

    const [overview] = await AnalyticsEvent.aggregate([
      { $match: { occurredAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: null,
          pageViews: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' },
          visitors: {
            $addToSet: {
              $cond: [{ $ifNull: ['$visitorId', false] }, '$visitorId', '$$REMOVE']
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          pageViews: 1,
          visits: { $size: '$sessions' },
          uniqueVisitors: { $size: '$visitors' }
        }
      }
    ]);

    res.status(200).json({
      summary: overview || { pageViews: 0, visits: 0, uniqueVisitors: 0 },
      period: { from: fromDate.toISOString(), to: toDate.toISOString() }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to get summary.', error: err.message });
  }
};

// Retrieve daily traffic timeseries for charting
export const getTimeseries = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0, 0));
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const fromDate = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
    const toDate = req.query.to ? new Date(String(req.query.to)) : defaultTo;

    const dailyAgg = await AnalyticsEvent.aggregate([
      { $match: { occurredAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt', timezone: 'UTC' } },
          pageViews: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          pageViews: 1,
          visits: { $size: '$sessions' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      dailyTraffic: dailyAgg,
      period: { from: fromDate.toISOString(), to: toDate.toISOString() }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to get timeseries.', error: err.message });
  }
};

// Retrieve popular pages and articles
export const getPages = async (req: Request, res: Response): Promise<void> => {
  try {
    const limitQuery = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
    const limit = Math.min(Math.max(isNaN(limitQuery) ? 10 : limitQuery, 1), 50);

    const now = new Date();
    const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0, 0));
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const fromDate = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
    const toDate = req.query.to ? new Date(String(req.query.to)) : defaultTo;

    const matchFilter = { occurredAt: { $gte: fromDate, $lte: toDate } };

    const [popularPages, popularArticles] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $project: { _id: 0, path: '$_id', views: 1 } },
        { $sort: { views: -1 } },
        { $limit: limit }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...matchFilter, articleId: { $exists: true, $ne: null } } },
        { $group: { _id: '$articleId', views: { $sum: 1 } } },
        { $project: { _id: 0, slug: '$_id', views: 1 } },
        { $sort: { views: -1 } },
        { $limit: limit }
      ])
    ]);

    res.status(200).json({
      popularPages,
      popularArticles,
      period: { from: fromDate.toISOString(), to: toDate.toISOString() }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to get popular pages.', error: err.message });
  }
};

// Retrieve traffic sources breakdown
export const getReferrers = async (req: Request, res: Response): Promise<void> => {
  try {
    const limitQuery = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
    const limit = Math.min(Math.max(isNaN(limitQuery) ? 10 : limitQuery, 1), 50);

    const now = new Date();
    const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0, 0));
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const fromDate = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
    const toDate = req.query.to ? new Date(String(req.query.to)) : defaultTo;

    const referrers = await AnalyticsEvent.aggregate([
      { $match: { occurredAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: { $ifNull: ['$referrerHost', 'direct'] }, visits: { $sum: 1 } } },
      { $project: { _id: 0, source: '$_id', visits: 1 } },
      { $sort: { visits: -1 } },
      { $limit: limit }
    ]);

    res.status(200).json({
      trafficSources: referrers,
      period: { from: fromDate.toISOString(), to: toDate.toISOString() }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to get referrers.', error: err.message });
  }
};

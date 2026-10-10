import api from './api';

export interface AnalyticsEventPayload {
  eventId: string;
  type: 'page_view';
  path: string;
  sessionId: string;
  visitorId?: string;
  referrerHost?: string;
}

export interface AnalyticsSummary {
  pageViews: number;
  visits: number;
  uniqueVisitors: number;
}

export interface DailyTrafficItem {
  date: string;
  pageViews: number;
  visits: number;
}

export interface PopularPageItem {
  path: string;
  views: number;
}

export interface PopularArticleItem {
  slug: string;
  views: number;
}

export interface TrafficSourceItem {
  source: string;
  visits: number;
}

export interface AnalyticsReport {
  summary: AnalyticsSummary;
  dailyTraffic: DailyTrafficItem[];
  popularPages: PopularPageItem[];
  popularArticles: PopularArticleItem[];
  trafficSources: TrafficSourceItem[];
  period: {
    from: string;
    to: string;
  };
  retentionDays: number;
}

// Ingest an anonymous page view event
export const recordAnalyticsEvent = async (payload: AnalyticsEventPayload): Promise<void> => {
  await api.post('/analytics/events', payload);
};

// Fetch aggregated website traffic report for the admin panel
export const getAnalyticsReport = async (params?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<AnalyticsReport> => {
  const response = await api.get<AnalyticsReport>('/analytics/report', { params });
  return response.data;
};

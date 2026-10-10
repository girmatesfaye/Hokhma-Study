import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  TrendingUp,
  Users,
  Eye,
  Globe,
  Calendar,
  RefreshCw,
  Clock,
  FileText,
  AlertCircle,
  BarChart3,
  Layers
} from 'lucide-react';
import { getAnalyticsReport, AnalyticsReport } from '../../services/analytics';

type RangePreset = 'today' | '7days' | '30days' | 'custom';

export default function AdminStatistics() {
  const { getTranslatedText } = useLanguage();
  // State tracking active date preset
  const [rangePreset, setRangePreset] = useState<RangePreset>('30days');
  // Custom date bounds states
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Storage for fetched analytics report
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  // Hovered day index for the interactive chart tooltip
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Compute ISO date range boundaries based on the selected preset
  const computeDateRange = useCallback((): { from: string; to: string } => {
    const now = new Date();
    const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    if (rangePreset === 'today') {
      const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      return { from: fromDate.toISOString(), to: toDate.toISOString() };
    }

    if (rangePreset === '7days') {
      const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6, 0, 0, 0, 0));
      return { from: fromDate.toISOString(), to: toDate.toISOString() };
    }

    if (rangePreset === 'custom' && customFrom && customTo) {
      const fromDate = new Date(customFrom + 'T00:00:00.000Z');
      const toCustom = new Date(customTo + 'T23:59:59.999Z');
      return { from: fromDate.toISOString(), to: toCustom.toISOString() };
    }

    // Default to last 30 days
    const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29, 0, 0, 0, 0));
    return { from: fromDate.toISOString(), to: toDate.toISOString() };
  }, [rangePreset, customFrom, customTo]);

  // Fetch report data from API
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { from, to } = computeDateRange();
      const data = await getAnalyticsReport({ from, to, limit: 15 });
      setReport(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch analytics statistics';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [computeDateRange]);

  // Synchronize report whenever date presets change
  useEffect(() => {
    if (rangePreset !== 'custom' || (customFrom && customTo)) {
      fetchReport();
    }
  }, [rangePreset, customFrom, customTo, fetchReport]);

  // Preset button options with Title Case labels
  const presets: { id: RangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom Range' },
  ];

  // Calculate highest daily value for dynamic chart scaling
  const maxMetric = Math.max(
    ...(report?.dailyTraffic.map((d) => Math.max(d.pageViews, d.visits)) || [1]),
    1
  );

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-nearblack dark:text-white flex items-center gap-2">
            <TrendingUp size={22} className="text-gold" />
            <span>Website Visit Statistics</span>
          </h2>
          <p className="text-xs text-mediumgrey mt-1">
            Anonymous Traffic Metrics · 90-Day Retention Window · UTC Reporting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Chips */}
          <div className="inline-flex rounded-lg border border-black/10 dark:border-white/10 p-1 bg-white dark:bg-slate-900 shadow-2xs">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setRangePreset(p.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  rangePreset === p.id
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 shadow-xs'
                    : 'text-mediumgrey hover:text-nearblack dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="p-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-mediumgrey hover:text-nearblack dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh Statistics"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Custom Range Date Pickers */}
      {rangePreset === 'custom' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-black/5 dark:border-white/5 rounded-xl flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-mediumgrey">From:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-lg text-nearblack dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-mediumgrey">To:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-lg text-nearblack dark:text-white"
            />
          </div>
          <button
            onClick={fetchReport}
            className="px-3 py-1.5 bg-navy text-white dark:bg-gold dark:text-slate-950 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        /* Error Alert State */
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Failed to Load Statistics</h4>
            <p className="text-xs mt-1">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-3 px-3 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        </div>
      ) : report ? (
        /* Rendered Analytics Content */
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 1. Page Views Card */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-mediumgrey">
                <span className="text-xs font-semibold tracking-wide">Page Views</span>
                <Eye size={17} className="text-gold" />
              </div>
              <div className="text-2xl font-bold font-serif text-nearblack dark:text-white">
                {report.summary.pageViews.toLocaleString()}
              </div>
              <p className="text-[11px] text-mediumgrey">
                Total accepted page views in period
              </p>
            </div>

            {/* 2. Visits Card */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-mediumgrey">
                <span className="text-xs font-semibold tracking-wide">Visits</span>
                <Clock size={17} className="text-gold" />
              </div>
              <div className="text-2xl font-bold font-serif text-nearblack dark:text-white">
                {report.summary.visits.toLocaleString()}
              </div>
              <p className="text-[11px] text-mediumgrey">
                Distinct sessions (30-minute inactivity boundary)
              </p>
            </div>

            {/* 3. Unique Visitors Card */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-mediumgrey">
                <span className="text-xs font-semibold tracking-wide">Unique Visitors</span>
                <Users size={17} className="text-gold" />
              </div>
              <div className="text-2xl font-bold font-serif text-nearblack dark:text-white">
                {report.summary.uniqueVisitors.toLocaleString()}
              </div>
              <p className="text-[11px] text-mediumgrey">
                Estimated distinct consenting browser devices
              </p>
            </div>
          </div>

          {/* Daily Traffic Visual Chart */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-base font-bold text-nearblack dark:text-white flex items-center gap-2">
                  <BarChart3 size={17} className="text-gold" />
                  <span>Daily Traffic</span>
                </h3>
                <p className="text-xs text-mediumgrey">Daily page views and visits in UTC</p>
              </div>
              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs font-medium text-mediumgrey">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-navy dark:bg-gold" />
                  <span>Page Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 dark:bg-slate-600" />
                  <span>Visits</span>
                </div>
              </div>
            </div>

            {/* Interactive Bar Chart View */}
            {report.dailyTraffic.length > 0 ? (
              <div className="space-y-2">
                <div className="h-48 flex items-end gap-1.5 sm:gap-2 pt-8 border-b border-black/5 dark:border-white/5 overflow-x-auto pb-2">
                  {report.dailyTraffic.map((day, idx) => {
                    const viewHeightPercent = Math.max((day.pageViews / maxMetric) * 100, 3);
                    const visitHeightPercent = Math.max((day.visits / maxMetric) * 100, 3);
                    const isHovered = hoveredDayIndex === idx;

                    return (
                      <div
                        key={day.date}
                        onMouseEnter={() => setHoveredDayIndex(idx)}
                        onMouseLeave={() => setHoveredDayIndex(null)}
                        className="flex-1 min-w-[20px] max-w-[40px] flex flex-col justify-end items-center h-full relative group cursor-pointer"
                      >
                        {/* Hover Tooltip Box */}
                        {isHovered && (
                          <div className="absolute -top-14 z-20 bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-fade-in font-mono">
                            <p className="font-bold">{day.date}</p>
                            <p className="text-gold font-sans">{day.pageViews} Page Views · {day.visits} Visits</p>
                          </div>
                        )}

                        {/* Dual Bar Group */}
                        <div className="w-full flex items-end justify-center gap-0.5 h-full">
                          {/* Page Views Bar */}
                          <div
                            style={{ height: `${viewHeightPercent}%` }}
                            className="w-1/2 bg-navy dark:bg-gold rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                          />
                          {/* Visits Bar */}
                          <div
                            style={{ height: `${visitHeightPercent}%` }}
                            className="w-1/2 bg-slate-300 dark:bg-slate-700 rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Date Axis Snippet */}
                <div className="flex justify-between text-[10px] font-mono text-mediumgrey pt-1">
                  <span>{report.dailyTraffic[0]?.date}</span>
                  <span>{report.dailyTraffic[Math.floor(report.dailyTraffic.length / 2)]?.date}</span>
                  <span>{report.dailyTraffic[report.dailyTraffic.length - 1]?.date}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-mediumgrey py-6 text-center">No traffic recorded for this period.</p>
            )}
          </div>

          {/* Breakdown Tables (Popular Pages, Articles, Traffic Sources) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Popular Pages Table */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-sm font-bold text-nearblack dark:text-white flex items-center gap-2 mb-3">
                  <Layers size={16} className="text-gold" />
                  <span>Popular Pages</span>
                </h4>
                {report.popularPages.length > 0 ? (
                  <div className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                    {report.popularPages.map((page) => (
                      <div key={page.path} className="py-2.5 flex items-center justify-between gap-3">
                        <span className="font-mono text-[11px] truncate text-nearblack dark:text-gray-200" title={page.path}>
                          {page.path}
                        </span>
                        <span className="font-semibold text-gold shrink-0">
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-mediumgrey py-4 text-center">No page traffic recorded.</p>
                )}
              </div>
            </div>

            {/* 2. Popular Articles Table */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-sm font-bold text-nearblack dark:text-white flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-gold" />
                  <span>Popular Articles</span>
                </h4>
                {report.popularArticles.length > 0 ? (
                  <div className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                    {report.popularArticles.map((art) => (
                      <div key={art.slug} className="py-2.5 flex items-center justify-between gap-3">
                        <span className="font-serif text-xs truncate text-nearblack dark:text-gray-200" title={art.slug}>
                          {art.slug}
                        </span>
                        <span className="font-semibold text-gold shrink-0">
                          {art.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-mediumgrey py-4 text-center">No article readings recorded.</p>
                )}
              </div>
            </div>

            {/* 3. Traffic Sources Table */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-sm font-bold text-nearblack dark:text-white flex items-center gap-2 mb-3">
                  <Globe size={16} className="text-gold" />
                  <span>Traffic Sources</span>
                </h4>
                {report.trafficSources.length > 0 ? (
                  <div className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                    {report.trafficSources.map((source) => (
                      <div key={source.source} className="py-2.5 flex items-center justify-between gap-3">
                        <span className="font-medium text-nearblack dark:text-gray-200">
                          {source.source === 'direct' ? 'Direct / Unknown' : source.source}
                        </span>
                        <span className="font-semibold text-gold shrink-0">
                          {source.visits.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-mediumgrey py-4 text-center">No referrer sources recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

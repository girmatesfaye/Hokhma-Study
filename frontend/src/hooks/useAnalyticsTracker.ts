import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { recordAnalyticsEvent } from '../services/analytics';

const SESSION_STORAGE_KEY = 'hokhma_session_id';
const SESSION_TIMESTAMP_KEY = 'hokhma_session_last_active';
const VISITOR_STORAGE_KEY = 'hokhma_visitor_id';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

// Retrieve existing active session ID or generate a new random UUID
const getOrCreateSessionId = (): string => {
  try {
    const now = Date.now();
    const existingId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const lastActive = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);

    // If existing session is within 30-minute active window, renew timestamp
    if (existingId && lastActive && now - parseInt(lastActive, 10) < SESSION_TIMEOUT_MS) {
      sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
      return existingId;
    }

    // Generate fresh anonymous session ID
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess_${Math.random().toString(36).substring(2)}_${now}`;

    sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
    sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
    return newId;
  } catch {
    return `sess_${Date.now()}`;
  }
};

// Retrieve or generate persistent anonymous browser ID
const getOrCreateVisitorId = (): string | undefined => {
  try {
    let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!visitorId) {
      visitorId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `vis_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return undefined;
  }
};

// Sanitize referrer into clean hostname without URL parameters
const getReferrerHost = (): string => {
  try {
    if (!document.referrer) return 'direct';
    const refUrl = new URL(document.referrer);
    // Ignore internal origin referrers as external traffic sources
    if (refUrl.origin === window.location.origin) return 'direct';
    return refUrl.hostname;
  } catch {
    return 'direct';
  }
};

// Custom React hook to automatically track route changes and page views
export function useAnalyticsTracker() {
  const { currentRoute, isAdmin } = useApp();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Exclude signed-in admin browsing from public traffic metrics
    if (isAdmin) return;

    const page = currentRoute.page;

    // Exclude admin management routes from analytics collection
    if (page === 'admin-login' || page === 'admin-dashboard' || page === 'article-editor' || page.startsWith('admin')) {
      return;
    }

    // Derive stable canonical path without sensitive query parameters
    let canonicalPath = '/';
    if (page === 'home') {
      canonicalPath = '/';
    } else if (page === 'article-detail' && currentRoute.slug) {
      canonicalPath = `/articles/${currentRoute.slug}`;
    } else if (page === 'topic-detail' && currentRoute.slug) {
      canonicalPath = `/topics/${currentRoute.slug}`;
    } else if (page === 'path-detail' && currentRoute.slug) {
      canonicalPath = `/paths/${currentRoute.slug}`;
    } else if (page === 'tag-detail' && currentRoute.slug) {
      canonicalPath = `/tags/${currentRoute.slug}`;
    } else if (page === 'topics') {
      canonicalPath = '/topics';
    } else if (page === 'questions') {
      canonicalPath = '/questions';
    } else if (page === 'paths') {
      canonicalPath = '/paths';
    } else if (page === 'about') {
      canonicalPath = '/about';
    } else if (page === 'resources') {
      canonicalPath = '/resources';
    } else if (page === 'search') {
      canonicalPath = '/search';
    } else {
      canonicalPath = `/${page}`;
    }

    // Deduplicate rapid React component re-renders for identical navigation
    if (lastTrackedPathRef.current === canonicalPath) {
      return;
    }
    lastTrackedPathRef.current = canonicalPath;

    // Generate unique event ID for idempotent ingestion
    const eventId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `evt_${Math.random().toString(36).substring(2)}_${Date.now()}`;

    const sessionId = getOrCreateSessionId();
    const visitorId = getOrCreateVisitorId();
    const referrerHost = getReferrerHost();

    // Fire non-blocking analytics ingestion request
    recordAnalyticsEvent({
      eventId,
      type: 'page_view',
      path: canonicalPath,
      sessionId,
      visitorId,
      referrerHost
    }).catch((err) => {
      // Browsing must remain completely undisturbed if analytics is down
      console.debug('Analytics event silently ignored:', err);
    });
  }, [currentRoute, isAdmin]);
}

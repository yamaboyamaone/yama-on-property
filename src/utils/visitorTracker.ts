import { VisitorStats, VisitRecord } from '../types';
import { INITIAL_VISITOR_STATS } from '../initialData';

function detectDevice(): 'Mobile' | 'Desktop' | 'Tablet' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return 'Mobile';
  }
  return 'Desktop';
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getStoredVisitorStats(): VisitorStats {
  try {
    const raw = localStorage.getItem('yama_visitor_stats');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return INITIAL_VISITOR_STATS;
}

export async function recordSiteVisit(page: string = '/'): Promise<VisitorStats> {
  const device = detectDevice();
  const today = getTodayString();
  const isNewSession = !sessionStorage.getItem('yama_session_active');

  const currentStats = getStoredVisitorStats();

  const isTodaySession = sessionStorage.getItem('yama_session_date') === today;
  sessionStorage.setItem('yama_session_active', '1');
  sessionStorage.setItem('yama_session_date', today);

  const updatedTotalVisitors = currentStats.totalVisitors + (isNewSession ? 1 : 0);
  const updatedTodayVisitors =
    (currentStats.todayVisitors || 0) + (isNewSession || !isTodaySession ? 1 : 0);
  const updatedPageViews = (currentStats.totalPageViews || 0) + 1;
  const updatedUniqueSessions = (currentStats.uniqueSessions || 0) + (isNewSession ? 1 : 0);

  const deviceBreakdown = {
    mobile: (currentStats.deviceBreakdown?.mobile || 0) + (device === 'Mobile' ? 1 : 0),
    desktop: (currentStats.deviceBreakdown?.desktop || 0) + (device === 'Desktop' ? 1 : 0),
    tablet: (currentStats.deviceBreakdown?.tablet || 0) + (device === 'Tablet' ? 1 : 0),
  };

  const newRecord: VisitRecord = {
    id: 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    device,
    page,
  };

  const recentVisits = [newRecord, ...(currentStats.recentVisits || [])].slice(0, 50);

  // Update daily visits
  const dailyList = [...(currentStats.dailyVisits || [])];
  const todayIndex = dailyList.findIndex((d) => d.date === today);
  if (todayIndex >= 0) {
    dailyList[todayIndex].count += 1;
  } else {
    dailyList.unshift({ date: today, count: 1 });
  }

  const newStats: VisitorStats = {
    totalVisitors: updatedTotalVisitors,
    todayVisitors: updatedTodayVisitors,
    totalPageViews: updatedPageViews,
    uniqueSessions: updatedUniqueSessions,
    deviceBreakdown,
    recentVisits,
    dailyVisits: dailyList.slice(0, 14),
  };

  try {
    localStorage.setItem('yama_visitor_stats', JSON.stringify(newStats));
  } catch {}

  // Post to server if available
  try {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device, page, isNewSession }),
    }).catch(() => {});
  } catch {}

  return newStats;
}

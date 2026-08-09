// Analytics Service for Tech Ceylon

import { v4 as uuidv4 } from 'uuid';
import { dbSet, dbGetAll, serverTimestamp } from '@/lib/firebase/db';

const VISITS_PATH = 'visits';

export interface DeviceInfo {
  /** 'Mobile' | 'Tablet' | 'Desktop' */
  type: string;
  os: string;
  browser: string;
}

export interface SiteVisit {
  visitId: string;
  /** Raw User-Agent string */
  userAgent: string;
  /** Parsed device details */
  device: DeviceInfo;
  referrer: string;
  path: string;
  timestamp: number;
  /** Firebase UID of the visitor, or 'guest' for unauthenticated users */
  userId: string;
  /** Display name of the visitor, or 'Guest' for unauthenticated users */
  userName: string;
  /** Visitor's public IP address */
  ip: string;
  /** Country derived from IP (best-effort) */
  country: string;
}

/** Parse device type, OS, and browser from a User-Agent string */
export function parseDevice(ua: string): DeviceInfo {
  // Device type
  const isMobile = /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Tablet|PlayBook/i.test(ua) || (isMobile && /Android/i.test(ua) && !/Mobile/i.test(ua));
  const type = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

  // OS
  let os = 'Unknown';
  if (/Windows NT 10/i.test(ua))       os = 'Windows 11/10';
  else if (/Windows NT 6\.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6\.1/i.test(ua)) os = 'Windows 7';
  else if (/Windows/i.test(ua))         os = 'Windows';
  else if (/iPhone OS/i.test(ua))       os = 'iOS';
  else if (/iPad.*OS/i.test(ua))        os = 'iPadOS';
  else if (/Android/i.test(ua))         os = 'Android';
  else if (/Mac OS X/i.test(ua))        os = 'macOS';
  else if (/Linux/i.test(ua))           os = 'Linux';

  // Browser
  let browser = 'Unknown';
  if (/Edg\//i.test(ua))               browser = 'Edge';
  else if (/OPR\//i.test(ua))          browser = 'Opera';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Browser';
  else if (/Chrome\/\d/i.test(ua))     browser = 'Chrome';
  else if (/Firefox\/\d/i.test(ua))    browser = 'Firefox';
  else if (/Safari\/\d/i.test(ua))     browser = 'Safari';

  return { type, os, browser };
}

/**
 * Fetch the visitor's public IP and country from ipapi.co.
 * Best-effort: returns 'Unknown' values on any failure.
 * Shared by recordSiteVisit, logUserLogin, logAdminLogin, etc.
 */
export async function fetchIpInfo(): Promise<{ ip: string; country: string }> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return { ip: data.ip || 'Unknown', country: data.country_name || 'Unknown' };
    }
  } catch {
    // Silently fail
  }
  return { ip: 'Unknown', country: 'Unknown' };
}

/**
 * Record a unique site visit.
 * @param path     - Current URL path
 * @param userId   - Firebase UID if logged in, omit or pass undefined for guests
 * @param userName - Display name if logged in, omit or pass undefined for guests
 */
export async function recordSiteVisit(
  path: string,
  userId?: string,
  userName?: string,
): Promise<boolean> {
  try {
    const visitId = uuidv4();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    const device = parseDevice(userAgent);
    const { ip, country } = await fetchIpInfo();

    const visit: SiteVisit = {
      visitId,
      userAgent,
      device,
      referrer,
      path,
      timestamp: serverTimestamp() as unknown as number,
      userId: userId || 'guest',
      userName: userName || 'Guest',
      ip,
      country,
    };

    await dbSet(`${VISITS_PATH}/${visitId}`, visit);
    return true;
  } catch (error) {
    // Silently fail to not interrupt user experience
    console.error('Failed to record site visit:', error);
    return false;
  }
}

/**
 * Get all site visits
 */
export async function getAllSiteVisits(): Promise<SiteVisit[]> {
  try {
    const visits = await dbGetAll<SiteVisit>(VISITS_PATH);
    return visits.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to fetch site visits:', error);
    return [];
  }
}

/**
 * Get recent site visits
 */
export async function getRecentSiteVisits(limit = 10): Promise<SiteVisit[]> {
  const visits = await getAllSiteVisits();
  return visits.slice(0, limit);
}

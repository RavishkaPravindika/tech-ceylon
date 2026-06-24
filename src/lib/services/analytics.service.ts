// Analytics Service for Tech Ceylon

import { v4 as uuidv4 } from 'uuid';
import { dbSet, dbGetAll, serverTimestamp } from '@/lib/firebase/db';

const VISITS_PATH = 'visits';

export interface SiteVisit {
  visitId: string;
  userAgent: string;
  referrer: string;
  path: string;
  timestamp: number;
}

/**
 * Record a unique site visit
 */
export async function recordSiteVisit(path: string): Promise<void> {
  try {
    const visitId = uuidv4();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const visit: SiteVisit = {
      visitId,
      userAgent,
      referrer,
      path,
      timestamp: serverTimestamp() as unknown as number,
    };

    await dbSet(`${VISITS_PATH}/${visitId}`, visit);
  } catch (error) {
    // Silently fail to not interrupt user experience
    console.error('Failed to record site visit:', error);
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

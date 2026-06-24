'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordSiteVisit } from '@/lib/services/analytics.service';

/**
 * SiteTracker
 * A hidden component that tracks unique visits to the website.
 * Uses sessionStorage to ensure we only log a visit once per session,
 * avoiding database spam on every page refresh.
 */
export function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Check if we've already tracked a visit for this session
    const hasVisited = sessionStorage.getItem('site_visit_tracked');

    if (!hasVisited) {
      // Record the visit
      recordSiteVisit(pathname || '/').then(() => {
        // Mark as visited so we don't track again on refresh
        sessionStorage.setItem('site_visit_tracked', 'true');
      });
    }
  }, [pathname]);

  // This component doesn't render anything
  return null;
}

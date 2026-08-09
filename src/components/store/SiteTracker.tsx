'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordSiteVisit } from '@/lib/services/analytics.service';
import { useAuthStore } from '@/store/authStore';

const SESSION_KEY = 'site_visit_tracked';
const STORAGE_KEY = 'site_visit_last_ts';
/** Minimum milliseconds between two recorded visits (24 hours). */
const VISIT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * SiteTracker
 * A hidden component that tracks unique visits to the website.
 *
 * Two-layer deduplication:
 *  1. sessionStorage  – prevents duplicate writes on every page refresh
 *     within the same browser tab/session.
 *  2. localStorage + timestamp – prevents counting a new session as a
 *     fresh visit if the user was already here within the last 24 hours.
 *
 * Records the visitor's device info (type/OS/browser) and user identity
 * (Firebase UID + name for logged-in users, 'guest'/'Guest' for anonymous).
 */
export function SiteTracker() {
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Wait for Firebase auth to resolve so we know who the visitor is
    if (isLoading) return;

    // Layer 1: already tracked this session (tab still open / refreshed)
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Layer 2: visited recently (within the cooldown window)
    const lastVisitTs = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    const isWithinCooldown = Date.now() - lastVisitTs < VISIT_COOLDOWN_MS;
    if (isWithinCooldown) {
      // Suppress DB write but still mark the session so we skip future checks
      sessionStorage.setItem(SESSION_KEY, 'true');
      return;
    }

    // Optimistically mark both stores BEFORE the async call to prevent
    // race conditions on fast refreshes firing a second write.
    sessionStorage.setItem(SESSION_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, String(Date.now()));

    // Pass user identity — logged-in user or anonymous guest
    const userId = user?.uid;
    const userName = user?.name;

    recordSiteVisit(pathname || '/', userId, userName).catch(() => {
      // Roll back the localStorage timestamp so we retry next visit
      localStorage.removeItem(STORAGE_KEY);
    });
  }, [isLoading, user, pathname]); // re-run once auth resolves

  // This component doesn't render anything
  return null;
}


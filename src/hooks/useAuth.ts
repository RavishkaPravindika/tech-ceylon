'use client';

// useAuth hook — manages user authentication lifecycle

import { useEffect } from 'react';
import { onAuthChange } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { upsertUser, logUserLogin } from '@/lib/services/users.service';
import { getAdminById } from '@/lib/services/admins.service';

export function useAuth() {
  const {
    firebaseUser,
    user,
    isLoading,
    isAuthenticated,
    setFirebaseUser,
    setUser,
    setIsLoading,
    clearAuth,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);

        // Guard: onAuthChange fires on every page refresh when Firebase
        // restores a persisted session. Only treat it as a real login
        // (and update lastLoginAt / write a log) the first time we see
        // this UID in the current browser session.
        const sessionKey = `auth_synced_${fbUser.uid}`;
        const alreadySynced = sessionStorage.getItem(sessionKey);

        try {
          if (alreadySynced) {
            // Session restore — just load the existing user record, no writes
            const { getUserById } = await import('@/lib/services/users.service');
            const existingUser = await getUserById(fbUser.uid);
            setUser(existingUser);
          } else {
            // Genuine login — upsert and log, then mark the session
            sessionStorage.setItem(sessionKey, 'true');
            const userData = await upsertUser({
              uid: fbUser.uid,
              name: fbUser.displayName || 'User',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || '',
            });
            setUser(userData);
            await logUserLogin(fbUser.uid, fbUser.displayName || 'User');
          }
        } catch (error) {
          console.error('Failed to sync user:', error);
          // Clear the flag so the next load retries properly
          sessionStorage.removeItem(sessionKey);
        }
      } else {
        clearAuth();
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [setFirebaseUser, setUser, setIsLoading, clearAuth]);

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
  };
}

/**
 * useAdminAuth — manages admin authentication lifecycle
 * Used in admin portal pages only
 */
export function useAdminAuth() {
  const {
    firebaseUser,
    admin,
    adminRole,
    isAdminAuthenticated,
    isAdminLoading,
    setFirebaseUser,
    setAdmin,
    setIsAdminLoading,
    clearAdminAuth,
    clearAuth,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const adminData = await getAdminById(fbUser.uid);
          setAdmin(adminData);
        } catch (error) {
          console.error('Failed to verify admin:', error);
          setAdmin(null);
        }
      } else {
        clearAuth();
        clearAdminAuth();
      }
      setIsAdminLoading(false);
    });

    return unsubscribe;
  }, [setFirebaseUser, setAdmin, setIsAdminLoading, clearAdminAuth, clearAuth]);

  return {
    firebaseUser,
    admin,
    adminRole,
    isAdminAuthenticated,
    isAdminLoading,
  };
}

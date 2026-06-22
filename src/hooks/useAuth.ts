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
        try {
          const userData = await upsertUser({
            uid: fbUser.uid,
            name: fbUser.displayName || 'User',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
          });
          setUser(userData);
          await logUserLogin(fbUser.uid, fbUser.displayName || 'User');
        } catch (error) {
          console.error('Failed to sync user:', error);
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

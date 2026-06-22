'use client';

// Auth Store (Zustand) for Tech Ceylon

import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { Admin, AdminRole } from '@/types/admin.types';
import { User } from '@/types/user.types';

interface AuthStore {
  // User auth state
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Admin auth state (separate)
  admin: Admin | null;
  adminRole: AdminRole | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;

  // Actions
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUser: (user: User | null) => void;
  setAdmin: (admin: Admin | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsAdminLoading: (loading: boolean) => void;
  clearAuth: () => void;
  clearAdminAuth: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  admin: null,
  adminRole: null,
  isAdminAuthenticated: false,
  isAdminLoading: true,

  setFirebaseUser: (firebaseUser) => {
    set({
      firebaseUser,
      isAuthenticated: firebaseUser !== null,
      isLoading: false,
    });
  },

  setUser: (user) => {
    set({ user });
  },

  setAdmin: (admin) => {
    set({
      admin,
      adminRole: admin?.role || null,
      isAdminAuthenticated: admin !== null,
      isAdminLoading: false,
    });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  setIsAdminLoading: (isAdminLoading) => {
    set({ isAdminLoading });
  },

  clearAuth: () => {
    set({
      firebaseUser: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  clearAdminAuth: () => {
    set({
      admin: null,
      adminRole: null,
      isAdminAuthenticated: false,
      isAdminLoading: false,
    });
  },
}));

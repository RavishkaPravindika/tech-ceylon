'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This initializes the auth state subscription for the entire app
  useAuth();

  return <>{children}</>;
}

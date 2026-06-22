'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useUIStore();

  useEffect(() => {
    // Read stored theme on mount
    const stored = localStorage.getItem('tc-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = stored || (prefersDark ? 'dark' : 'light');

    setTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [setTheme]);

  return <>{children}</>;
}

'use client';

// useSettings hook — fetches live store settings from Firebase

import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/services/settings.service';
import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings.types';

interface UseSettingsReturn {
  settings: AppSettings;
  isLoading: boolean;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((s) => setSettings(s as AppSettings))
      .catch(() => {
        // Fall back to defaults on error
        setSettings(DEFAULT_SETTINGS);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { settings, isLoading };
}

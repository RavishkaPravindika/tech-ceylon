// Settings Service for Tech Ceylon

import { dbGet, dbSet, serverTimestamp } from '@/lib/firebase/db';
import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings.types';
import { createLog } from './logs.service';

const SETTINGS_PATH = 'settings';

/**
 * Get store settings (returns defaults if not yet saved)
 */
export async function getSettings(): Promise<AppSettings> {
  const settings = await dbGet<AppSettings>(SETTINGS_PATH);
  if (!settings) {
    return { ...DEFAULT_SETTINGS };
  }
  // Merge with defaults so new fields are always present
  return { ...DEFAULT_SETTINGS, ...settings };
}

/**
 * Update store settings (SUPER_ADMIN only)
 */
export async function updateSettings(
  data: Partial<Omit<AppSettings, 'updatedAt' | 'updatedBy'>>,
  updatedBy: string,
  updatedByName: string
): Promise<void> {
  const existing = await getSettings();
  const updated: AppSettings = {
    ...existing,
    ...data,
    updatedAt: serverTimestamp() as unknown as number,
    updatedBy,
  };

  await dbSet(SETTINGS_PATH, updated);

  await createLog({
    userId: updatedBy,
    userName: updatedByName,
    action: 'admin:update_settings',
    entity: 'settings',
    details: { updatedFields: Object.keys(data) },
  });
}

/**
 * Initialize settings with defaults if not present
 */
export async function initializeSettings(): Promise<void> {
  const existing = await dbGet<AppSettings>(SETTINGS_PATH);
  if (!existing) {
    await dbSet(SETTINGS_PATH, {
      ...DEFAULT_SETTINGS,
      updatedAt: Date.now(),
      updatedBy: 'system',
    });
  }
}

// Users Service for Tech Ceylon

import { dbSet, dbGet, dbGetAll, dbUpdate, serverTimestamp } from '@/lib/firebase/db';
import { User } from '@/types/user.types';
import { createLog } from './logs.service';
import { fetchIpInfo, parseDevice } from './analytics.service';

const USERS_PATH = 'users';

/**
 * Upsert a user record on login (create if new, update lastLoginAt if existing)
 */
export async function upsertUser(userData: {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
}): Promise<User> {
  const existing = await dbGet<User>(`${USERS_PATH}/${userData.uid}`);
  const now = serverTimestamp();

  if (existing) {
    // Preserve the user's custom name — only refresh photo and lastLoginAt
    const updated: User = {
      ...existing,
      photoURL: userData.photoURL,
      lastLoginAt: now,
    };
    await dbUpdate(`${USERS_PATH}/${userData.uid}`, {
      lastLoginAt: now,
      photoURL: userData.photoURL,
    });
    return updated;
  } else {
    // Create new user
    const user: User = {
      uid: userData.uid,
      name: userData.name,
      email: userData.email,
      photoURL: userData.photoURL,
      createdAt: now,
      lastLoginAt: now,
    };
    await dbSet(`${USERS_PATH}/${userData.uid}`, user);
    return user;
  }
}

/**
 * Get a user by UID
 */
export async function getUserById(uid: string): Promise<User | null> {
  return dbGet<User>(`${USERS_PATH}/${uid}`);
}

/**
 * Update a user's display name
 */
export async function updateUserName(uid: string, name: string): Promise<void> {
  await dbUpdate(`${USERS_PATH}/${uid}`, { name });
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const all = await dbGetAll<User>(USERS_PATH);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Log user login event — captures device, IP, and country
 */
export async function logUserLogin(uid: string, name: string): Promise<void> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const device = parseDevice(userAgent);
  const { ip, country } = await fetchIpInfo();
  await createLog({
    userId: uid,
    userName: name,
    action: 'user:login',
    entity: 'user',
    entityId: uid,
    ip,
    country,
    device,
    details: { userAgent },
  });
}

/**
 * Log user logout event — captures device info
 */
export async function logUserLogout(uid: string, name: string): Promise<void> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const device = parseDevice(userAgent);
  await createLog({
    userId: uid,
    userName: name,
    action: 'user:logout',
    entity: 'user',
    entityId: uid,
    device,
    details: { userAgent },
  });
}

/**
 * Get user registrations per month for chart data
 */
export async function getUserRegistrationsPerMonth(): Promise<{ month: string; users: number }[]> {
  const all = await getAllUsers();
  const now = new Date();
  const result: { month: string; users: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthUsers = all.filter(
      (u) => u.createdAt >= date.getTime() && u.createdAt < nextDate.getTime()
    );
    result.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      users: monthUsers.length,
    });
  }

  return result;
}

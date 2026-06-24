// Users Service for Tech Ceylon

import { dbSet, dbGet, dbGetAll, dbUpdate, serverTimestamp } from '@/lib/firebase/db';
import { User } from '@/types/user.types';
import { createLog } from './logs.service';

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
    // Update last login
    const updated: User = {
      ...existing,
      name: userData.name,
      photoURL: userData.photoURL,
      lastLoginAt: now,
    };
    await dbUpdate(`${USERS_PATH}/${userData.uid}`, { lastLoginAt: now, name: userData.name, photoURL: userData.photoURL });
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
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const all = await dbGetAll<User>(USERS_PATH);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Log user login event
 */
export async function logUserLogin(uid: string, name: string): Promise<void> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  await createLog({
    userId: uid,
    userName: name,
    action: 'user:login',
    entity: 'user',
    entityId: uid,
    details: { userAgent },
  });
}

/**
 * Log user logout event
 */
export async function logUserLogout(uid: string, name: string): Promise<void> {
  await createLog({
    userId: uid,
    userName: name,
    action: 'user:logout',
    entity: 'user',
    entityId: uid,
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

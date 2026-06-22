// Firebase Realtime Database helpers for Tech Ceylon
// This module works on both client and server (see conditional logic in functions)

import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  limitToLast,
  DataSnapshot,
  DatabaseReference,
  Unsubscribe,
} from 'firebase/database';
import { getFirebaseDB } from './config';

/**
 * Get a database reference
 */
export function dbRef(path: string): DatabaseReference {
  return ref(getFirebaseDB(), path);
}

/**
 * Set a value at a path (overwrites)
 */
export async function dbSet<T>(path: string, data: T): Promise<void> {
  await set(dbRef(path), data);
}

/**
 * Update specific fields at a path (partial update)
 */
export async function dbUpdate<T extends Record<string, unknown>>(
  path: string,
  data: T
): Promise<void> {
  await update(dbRef(path), data);
}

/**
 * Get a value once from a path
 */
export async function dbGet<T>(path: string): Promise<T | null> {
  if (typeof window === 'undefined') {
    const url = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/${path}.json`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T | null;
  }

  const snapshot: DataSnapshot = await get(dbRef(path));
  if (!snapshot.exists()) return null;
  return snapshot.val() as T;
}

/**
 * Get all children of a path as an array
 */
export async function dbGetAll<T>(path: string): Promise<T[]> {
  if (typeof window === 'undefined') {
    const url = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/${path}.json`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data) return [];
    // Firebase may return arrays with nulls if keys are sequential integers with gaps
    const all = Object.values(data).filter(Boolean);
    return all as T[];
  }

  const snapshot: DataSnapshot = await get(dbRef(path));
  if (!snapshot.exists()) return [];
  const result: T[] = [];
  snapshot.forEach((child) => {
    result.push(child.val() as T);
  });
  return result;
}

/**
 * Push a new child (auto-generated key)
 */
export async function dbPush<T>(path: string, data: T): Promise<string> {
  const newRef = push(dbRef(path));
  await set(newRef, data);
  return newRef.key!;
}

/**
 * Delete a value at a path
 */
export async function dbDelete(path: string): Promise<void> {
  await remove(dbRef(path));
}

/**
 * Subscribe to real-time updates at a path
 */
export function dbSubscribe<T>(
  path: string,
  callback: (data: T | null) => void
): Unsubscribe {
  const r = dbRef(path);
  onValue(r, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as T) : null);
  });
  return () => off(r);
}

/**
 * Query children ordered by a child field with a specific value
 */
export async function dbQueryByChild<T>(
  path: string,
  childKey: string,
  value: string | number | boolean
): Promise<T[]> {
  if (typeof window === 'undefined') {
    const url = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/${path}.json`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data) return [];
    const all = Object.values(data).filter(Boolean) as Record<string, any>[];
    return all.filter((item) => item[childKey] === value) as T[];
  }

  const r = query(dbRef(path), orderByChild(childKey), equalTo(value));
  const snapshot = await get(r);
  if (!snapshot.exists()) return [];
  const result: T[] = [];
  snapshot.forEach((child) => {
    result.push(child.val() as T);
  });
  return result;
}

/**
 * Get last N items ordered by a child field
 */
export async function dbGetLatest<T>(path: string, limit: number): Promise<T[]> {
  if (typeof window === 'undefined') {
    const url = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/${path}.json?orderBy="$key"&limitToLast=${limit}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data) return [];
    const all = Object.values(data).filter(Boolean);
    return all.reverse() as T[];
  }

  const r = query(dbRef(path), limitToLast(limit));
  const snapshot = await get(r);
  if (!snapshot.exists()) return [];
  const result: T[] = [];
  snapshot.forEach((child) => {
    result.push(child.val() as T);
  });
  return result.reverse();
}

/**
 * Generate a server timestamp value
 */
export function serverTimestamp(): number {
  return Date.now();
}

export {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  limitToLast,
};

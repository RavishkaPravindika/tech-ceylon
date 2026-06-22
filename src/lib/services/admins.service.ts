// Admins Service for Tech Ceylon

import { dbSet, dbGet, dbGetAll, dbDelete, serverTimestamp } from '@/lib/firebase/db';
import { Admin, AdminFormData, AdminRole, SUPER_ADMIN_EMAIL } from '@/types/admin.types';
import { createLog } from './logs.service';

const ADMINS_PATH = 'admins';

/**
 * Check if a user is an admin
 */
export async function isAdmin(uid: string): Promise<boolean> {
  const admin = await dbGet<Admin>(`${ADMINS_PATH}/${uid}`);
  return admin !== null;
}

/**
 * Get admin record by UID
 */
export async function getAdminById(uid: string): Promise<Admin | null> {
  return dbGet<Admin>(`${ADMINS_PATH}/${uid}`);
}

/**
 * Get admin role
 */
export async function getAdminRole(uid: string): Promise<AdminRole | null> {
  const admin = await getAdminById(uid);
  return admin?.role || null;
}

/**
 * Get all admins (SUPER_ADMIN only)
 */
export async function getAllAdmins(): Promise<Admin[]> {
  const all = await dbGetAll<Admin>(ADMINS_PATH);
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Add a new admin (SUPER_ADMIN only)
 */
export async function addAdmin(
  data: AdminFormData & { uid: string; name: string },
  addedBy: string,
  addedByName: string
): Promise<Admin> {
  const now = serverTimestamp();

  const admin: Admin = {
    uid: data.uid,
    name: data.name,
    email: data.email,
    role: data.role,
    addedBy,
    createdAt: now,
  };

  await dbSet(`${ADMINS_PATH}/${data.uid}`, admin);

  await createLog({
    userId: addedBy,
    userName: addedByName,
    action: 'admin:add_admin',
    entity: 'admin',
    entityId: data.uid,
    details: { adminEmail: data.email, role: data.role },
  });

  return admin;
}

/**
 * Remove an admin (SUPER_ADMIN only, cannot remove self)
 */
export async function removeAdmin(
  uid: string,
  removedBy: string,
  removedByName: string
): Promise<void> {
  const admin = await getAdminById(uid);
  if (!admin) throw new Error('Admin not found');
  if (admin.email === SUPER_ADMIN_EMAIL) {
    throw new Error('Cannot remove the Super Admin');
  }

  await dbDelete(`${ADMINS_PATH}/${uid}`);

  await createLog({
    userId: removedBy,
    userName: removedByName,
    action: 'admin:delete_admin',
    entity: 'admin',
    entityId: uid,
    details: { adminEmail: admin.email },
  });
}

/**
 * Seed the super admin on first run
 * This should be called once during initialization
 */
export async function seedSuperAdmin(uid: string, name: string, email: string): Promise<void> {
  if (email !== SUPER_ADMIN_EMAIL) return;

  const existing = await getAdminById(uid);
  if (existing) return; // Already exists

  const now = serverTimestamp();
  const superAdmin: Admin = {
    uid,
    name,
    email,
    role: 'SUPER_ADMIN',
    addedBy: 'system',
    createdAt: now,
  };

  await dbSet(`${ADMINS_PATH}/${uid}`, superAdmin);
}

/**
 * Log admin login event
 */
export async function logAdminLogin(uid: string, name: string): Promise<void> {
  await createLog({
    userId: uid,
    userName: name,
    action: 'admin:login',
    entity: 'admin',
    entityId: uid,
  });
}

/**
 * Log admin logout event
 */
export async function logAdminLogout(uid: string, name: string): Promise<void> {
  await createLog({
    userId: uid,
    userName: name,
    action: 'admin:logout',
    entity: 'admin',
    entityId: uid,
  });
}

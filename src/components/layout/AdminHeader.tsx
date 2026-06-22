'use client';

import { usePathname } from 'next/navigation';
import { Bell, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { getInitials, stringToColor } from '@/lib/utils/formatters';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/create': 'Create Product',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/admins': 'Manage Admins',
  '/admin/logs': 'Audit Logs',
  '/admin/settings': 'Settings',
};

export function AdminHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useUIStore();
  const { admin, firebaseUser } = useAuthStore();

  const title =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] || 'Admin';

  const name = firebaseUser?.displayName || admin?.name || 'Admin';
  const photo = firebaseUser?.photoURL;
  const role = admin?.role;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] shrink-0">
      {/* Title */}
      <div>
        <h1 className="font-poppins font-bold text-lg text-[var(--text-primary)]">{title}</h1>
        {role && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            role === 'SUPER_ADMIN'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
          }`}>
            {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
          </span>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          id="admin-theme-toggle"
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2.5">
          {photo ? (
            <Image
              src={photo}
              alt={name}
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl object-cover"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: stringToColor(name) }}
            >
              {getInitials(name)}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{name}</p>
            <p className="text-xs text-[var(--text-muted)]">{firebaseUser?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

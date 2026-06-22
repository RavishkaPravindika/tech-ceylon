'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Shield,
  ScrollText, Settings, ChevronLeft, ChevronRight, LogOut, ExternalLink
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants/routes';
import { signOut } from '@/lib/firebase/auth';
import { logAdminLogout } from '@/lib/services/admins.service';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Products', href: ROUTES.ADMIN_PRODUCTS, icon: Package, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Categories', href: ROUTES.ADMIN_CATEGORIES, icon: Tag, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Orders', href: ROUTES.ADMIN_ORDERS, icon: ShoppingBag, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Admins', href: ROUTES.ADMIN_ADMINS, icon: Shield, roles: ['SUPER_ADMIN'] },
  { label: 'Logs', href: ROUTES.ADMIN_LOGS, icon: ScrollText, roles: ['SUPER_ADMIN'] },
  { label: 'Settings', href: ROUTES.ADMIN_SETTINGS, icon: Settings, roles: ['SUPER_ADMIN'] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isAdminSidebarCollapsed, toggleAdminSidebar } = useUIStore();
  const { admin, firebaseUser, clearAdminAuth, clearAuth } = useAuthStore();

  const handleSignOut = async () => {
    try {
      if (firebaseUser) {
        await logAdminLogout(firebaseUser.uid, firebaseUser.displayName || 'Admin');
      }
      await signOut();
      clearAdminAuth();
      clearAuth();
      toast.success('Signed out');
      window.location.href = ROUTES.ADMIN_LOGIN;
    } catch {
      toast.error('Sign out failed');
    }
  };

  const visibleLinks = NAV_ITEMS.filter(
    (item) => !admin?.role || item.roles.includes(admin.role)
  );

  return (
    <aside
      className={`relative flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-all duration-300 ${
        isAdminSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[var(--border-color)] ${isAdminSidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 shrink-0 rounded-xl bg-brand-gradient flex items-center justify-center">
          <span className="text-white font-bold text-sm">TC</span>
        </div>
        {!isAdminSidebarCollapsed && (
          <div>
            <p className="font-poppins font-bold text-sm text-[var(--text-primary)]">Tech Ceylon</p>
            <p className="text-xs text-[var(--text-muted)]">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visibleLinks.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== ROUTES.ADMIN_DASHBOARD && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              id={`admin-nav-${label.toLowerCase()}`}
              title={isAdminSidebarCollapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              } ${isAdminSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              {!isAdminSidebarCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border-color)] p-2 space-y-1">
        <a
          href={ROUTES.HOME}
          target="_blank"
          rel="noopener noreferrer"
          title={isAdminSidebarCollapsed ? 'View Store' : undefined}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all ${isAdminSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <ExternalLink size={14} />
          {!isAdminSidebarCollapsed && 'View Store'}
        </a>
        <button
          onClick={handleSignOut}
          id="admin-sign-out"
          title={isAdminSidebarCollapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all ${isAdminSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={14} />
          {!isAdminSidebarCollapsed && 'Sign Out'}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleAdminSidebar}
        id="sidebar-collapse-toggle"
        className="absolute -right-3 top-20 w-6 h-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] shadow-sm transition-all"
      >
        {isAdminSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ROUTES } from '@/lib/constants/routes';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();

  const isLoginPage = pathname === ROUTES.ADMIN_LOGIN;

  useEffect(() => {
    if (!isAdminLoading && !isAdminAuthenticated && !isLoginPage) {
      router.replace(ROUTES.ADMIN_LOGIN);
    }
  }, [isAdminAuthenticated, isAdminLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

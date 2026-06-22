'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Shield } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleOneTap';
import { useAdminAuth } from '@/hooks/useAuth';
import { getAdminById, seedSuperAdmin, logAdminLogin } from '@/lib/services/admins.service';
import { signOut } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants/routes';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const { setAdmin } = useAuthStore();

  useEffect(() => {
    if (!isAdminLoading && isAdminAuthenticated) {
      router.replace(ROUTES.ADMIN_DASHBOARD);
    }
  }, [isAdminAuthenticated, isAdminLoading, router]);

  const handleSignInSuccess = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const { getAuth } = await import('firebase/auth');
      const { getFirebaseApp } = await import('@/lib/firebase/config');
      const auth = getAuth(getFirebaseApp());
      const fbUser = auth.currentUser;

      if (!fbUser) {
        setError('Authentication failed. Please try again.');
        return;
      }

      // Try to seed super admin on first sign-in
      await seedSuperAdmin(fbUser.uid, fbUser.displayName || 'Admin', fbUser.email || '');

      // Check if this user is an admin
      const adminData = await getAdminById(fbUser.uid);

      if (!adminData) {
        // Not an admin — sign them out
        await signOut();
        setError('Access denied. You are not authorized to access the admin portal.');
        return;
      }

      // Set admin in store
      setAdmin(adminData);

      // Log the login
      await logAdminLogin(fbUser.uid, fbUser.displayName || 'Admin');

      toast.success(`Welcome, ${fbUser.displayName?.split(' ')[0]}!`);
      router.replace(ROUTES.ADMIN_DASHBOARD);
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gradient rounded-2xl shadow-xl mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-poppins font-bold text-[var(--text-primary)]">Admin Portal</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Tech Ceylon Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 shadow-xl space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {isVerifying ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-[var(--text-muted)]">Verifying admin access...</p>
            </div>
          ) : (
            <>
              <GoogleSignInButton
                onSuccess={handleSignInSuccess}
                label="Sign in with Google"
              />

              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
                <p className="text-xs text-blue-700 dark:text-blue-400 text-center">
                  🔒 Admin access is restricted. Your Google account must be authorized before you can enter.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Not an admin?{' '}
          <a href="/" className="text-blue-600 hover:underline">
            Return to store
          </a>
        </p>
      </div>
    </div>
  );
}

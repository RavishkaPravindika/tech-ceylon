'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShoppingBag, Star, Zap } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleOneTap';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants/routes';
import { APP_NAME } from '@/lib/constants/config';

const BENEFITS = [
  { icon: ShoppingBag, text: 'Save your cart across devices' },
  { icon: Star, text: 'Get personalized recommendations' },
  { icon: Zap, text: 'Faster checkout with saved info' },
  { icon: Shield, text: 'Secure Google authentication' },
];

export function LoginClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.HOME);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = () => {
    router.replace(ROUTES.HOME);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gradient rounded-2xl shadow-xl mb-4">
            <span className="text-white font-bold text-xl">TC</span>
          </div>
          <h1 className="text-2xl font-poppins font-bold text-[var(--text-primary)]">
            Sign in to {APP_NAME}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            Use your Google account to sign in
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 shadow-xl space-y-6">
          <GoogleSignInButton onSuccess={handleSuccess} label="Continue with Google" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-card)]">
                Why sign in?
              </span>
            </div>
          </div>

          <ul className="space-y-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/40 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-blue-600" />
                </div>
                {text}
              </li>
            ))}
          </ul>

          <p className="text-xs text-center text-[var(--text-muted)]">
            By signing in, you agree to our terms of service. We only use your Google profile info.
          </p>
        </div>
      </div>
    </div>
  );
}

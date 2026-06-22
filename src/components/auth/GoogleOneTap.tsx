'use client';

// Google One Tap Authentication Component for Tech Ceylon

import { useEffect, useCallback } from 'react';
import { signInWithGoogleCredential } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { upsertUser } from '@/lib/services/users.service';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
          cancel: () => void;
          renderButton: (element: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: string;
}

interface PromptMomentNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

export function GoogleOneTap() {
  const { isAuthenticated, isLoading, setFirebaseUser, setUser } = useAuthStore();

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        const fbUser = await signInWithGoogleCredential(response.credential);
        setFirebaseUser(fbUser);

        const userData = await upsertUser({
          uid: fbUser.uid,
          name: fbUser.displayName || 'User',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
        });
        setUser(userData);

        toast.success(`Welcome back, ${fbUser.displayName?.split(' ')[0]}! 👋`);
      } catch (error) {
        console.error('Google One Tap sign-in failed:', error);
        toast.error('Sign-in failed. Please try again.');
      }
    },
    [setFirebaseUser, setUser]
  );

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initOneTap = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One tap not shown, user may have dismissed it before
        }
      });
    };

    // Load Google Identity script
    if (window.google?.accounts) {
      initOneTap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initOneTap;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [isAuthenticated, isLoading, handleCredentialResponse]);

  return null; // Renders Google's floating One Tap UI natively
}

/**
 * Standalone Google Sign-In Button (for login page)
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  label = 'Continue with Google',
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  label?: string;
}) {
  const { setFirebaseUser, setUser } = useAuthStore();

  const handleSignIn = useCallback(async () => {
    const { GoogleAuthProvider, signInWithPopup, getAuth } = await import('firebase/auth');
    const { getFirebaseApp } = await import('@/lib/firebase/config');

    try {
      const auth = getAuth(getFirebaseApp());
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setFirebaseUser(result.user);
      const userData = await upsertUser({
        uid: result.user.uid,
        name: result.user.displayName || 'User',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
      });
      setUser(userData);
      toast.success(`Welcome, ${result.user.displayName?.split(' ')[0]}! 👋`);
      onSuccess?.();
    } catch (err) {
      const error = err as Error;
      console.error('Google sign-in failed:', error);
      toast.error('Sign-in failed. Please try again.');
      onError?.(error);
    }
  }, [setFirebaseUser, setUser, onSuccess, onError]);

  return (
    <button
      onClick={handleSignIn}
      id="google-signin-button"
      className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-800 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-secondary)] transition-all shadow-sm hover:shadow-md font-medium text-[var(--text-primary)] text-sm"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  );
}

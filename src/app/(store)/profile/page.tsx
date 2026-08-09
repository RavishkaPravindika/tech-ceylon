'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Mail, Calendar, Edit3, Check, X, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { updateUserName } from '@/lib/services/users.service';
import { logUserLogout } from '@/lib/services/users.service';
import { signOut } from '@/lib/firebase/auth';
import { ROUTES } from '@/lib/constants/routes';
import { getInitials, stringToColor, formatDateTime } from '@/lib/utils/formatters';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, firebaseUser, isLoading, isAuthenticated, setUser, clearAuth } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, router]);

  // Sync name input when user loads
  useEffect(() => {
    if (user) setNameInput(user.name || '');
  }, [user]);

  const handleSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { toast.error('Name cannot be empty'); return; }
    if (trimmed === user?.name) { setIsEditing(false); return; }
    if (trimmed.length < 2) { toast.error('Name must be at least 2 characters'); return; }
    if (trimmed.length > 50) { toast.error('Name must be under 50 characters'); return; }

    setIsSaving(true);
    try {
      await updateUserName(user!.uid, trimmed);
      // Update the store so the header updates immediately
      setUser({ ...user!, name: trimmed });
      toast.success('Name updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNameInput(user?.name || '');
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      if (firebaseUser) {
        await logUserLogout(firebaseUser.uid, firebaseUser.displayName || 'User');
      }
      await signOut();
      clearAuth();
      toast.success('Signed out successfully');
      router.replace(ROUTES.HOME);
    } catch {
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !firebaseUser) return null;

  const avatarBg = stringToColor(user.name || 'U');
  const initials = getInitials(user.name || 'U');

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Page title */}
        <div className="mb-2">
          <h1 className="text-2xl font-poppins font-bold text-[var(--text-primary)]">My Profile</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your account details</p>
        </div>

        {/* Avatar + basic info card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {firebaseUser.photoURL ? (
                <Image
                  src={firebaseUser.photoURL}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-2xl object-cover shadow-md"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  style={{ backgroundColor: avatarBg }}
                >
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-green-500 rounded-full border-2 border-[var(--bg-card)]" title="Active" />
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-sm text-[var(--text-muted)] truncate">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-medium rounded-full">
                <Shield size={10} /> Google Account
              </span>
            </div>
          </div>
        </div>

        {/* Edit Name card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center">
                <User size={15} className="text-blue-600" />
              </div>
              <h2 className="font-semibold text-[var(--text-primary)]">Display Name</h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 rounded-lg transition-all"
              >
                <Edit3 size={12} /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                maxLength={50}
                placeholder="Your display name"
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !nameInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-sm"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-sm font-medium rounded-xl transition-all"
                >
                  <X size={14} /> Cancel
                </button>
                <p className="ml-auto text-xs text-[var(--text-muted)]">{nameInput.length}/50</p>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Press Enter to save · Esc to cancel</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-primary)] px-1">{user.name}</p>
          )}
        </div>

        {/* Account info card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Account Info</h2>
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center shrink-0">
                <Mail size={14} className="text-[var(--text-muted)]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-muted)]">Email</p>
                <p className="text-sm text-[var(--text-primary)] truncate">{user.email}</p>
              </div>
              <span className="ml-auto shrink-0 text-xs text-green-600 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium">
                Verified
              </span>
            </div>

            <div className="border-t border-[var(--border-color)]" />

            {/* Member since */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Member since</p>
                <p className="text-sm text-[var(--text-primary)]">{formatDateTime(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}

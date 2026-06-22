'use client';

import { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, AlertCircle } from 'lucide-react';
import { getAllAdmins, addAdmin, removeAdmin } from '@/lib/services/admins.service';
import { Admin, AdminRole } from '@/types/admin.types';
import { useAuthStore } from '@/store/authStore';
import { formatDateTime, getInitials, stringToColor } from '@/lib/utils/formatters';
import { SUPER_ADMIN_EMAIL } from '@/types/admin.types';
import toast from 'react-hot-toast';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('ADMIN');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { admin: currentAdmin, firebaseUser } = useAuthStore();

  // SUPER_ADMIN only guard
  if (currentAdmin?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Access Denied</h2>
        <p className="text-sm text-[var(--text-secondary)]">Only Super Admins can manage admins.</p>
      </div>
    );
  }

  const loadAdmins = async () => {
    setIsLoading(true);
    try { setAdmins(await getAllAdmins()); }
    catch { toast.error('Failed to load admins'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !email) return;
    setIsSubmitting(true);
    try {
      // Note: In a real setup, you'd look up the UID from email via Firebase Admin SDK.
      // For now, admins must sign in first to get a UID. We store email-based placeholder.
      const newAdmin = await addAdmin(
        { uid: email.replace(/[^a-z0-9]/gi, '_'), name: email.split('@')[0], email, role },
        firebaseUser.uid,
        firebaseUser.displayName || 'Super Admin'
      );
      setAdmins((prev) => [...prev, newAdmin]);
      setEmail('');
      setShowForm(false);
      toast.success(`Admin ${email} added. They must sign in to complete setup.`);
    } catch (err: any) { toast.error(err.message || 'Failed to add admin'); }
    finally { setIsSubmitting(false); }
  };

  const handleRemoveAdmin = async (uid: string) => {
    if (!firebaseUser) return;
    try {
      await removeAdmin(uid, firebaseUser.uid, firebaseUser.displayName || 'Super Admin');
      setAdmins((prev) => prev.filter((a) => a.uid !== uid));
      toast.success('Admin removed');
    } catch (err: any) { toast.error(err.message || 'Failed to remove admin'); }
    finally { setConfirmDelete(null); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} id="add-admin-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md">
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {/* Add Admin Form */}
      {showForm && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Add New Admin</h3>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl p-3 mb-4">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              <strong>Note:</strong> The person must first sign in with their Google account at /admin/login. 
              Add their email below and their UID will be matched on their first login.
            </p>
          </div>
          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="admin@example.com"
              className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500" />
            <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)}
              className="px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500">
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl text-sm hover:bg-[var(--bg-secondary)] transition-all">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-all">
                {isSubmitting ? 'Adding...' : 'Add Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">Loading admins...</div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {admins.map((a) => (
              <div key={a.uid} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: stringToColor(a.name) }}>
                  {getInitials(a.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)]">{a.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{a.email}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${a.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'}`}>
                  {a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
                <p className="text-xs text-[var(--text-muted)] hidden sm:block shrink-0">{formatDateTime(a.createdAt)}</p>
                {a.email !== SUPER_ADMIN_EMAIL && (
                  <button onClick={() => setConfirmDelete(a.uid)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-500 transition-all shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
                {a.email === SUPER_ADMIN_EMAIL && (
                  <div className="p-1.5">
                    <Shield size={14} className="text-purple-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Remove Admin?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">This will revoke admin access immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl text-sm">Cancel</button>
              <button onClick={() => handleRemoveAdmin(confirmDelete)} id="confirm-remove-admin" className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

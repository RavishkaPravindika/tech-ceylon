'use client';

import { useEffect, useState } from 'react';
import { Save, Globe, Phone, AlertTriangle } from 'lucide-react';
import { getSettings, updateSettings } from '@/lib/services/settings.service';
import { useAuthStore } from '@/store/authStore';
import { AppSettings } from '@/types/settings.types';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { admin, firebaseUser } = useAuthStore();

  if (admin?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={40} className="text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Access Denied</h2>
        <p className="text-sm text-[var(--text-secondary)]">Only Super Admins can change settings.</p>
      </div>
    );
  }

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!firebaseUser) return;
    setIsSaving(true);
    try {
      await updateSettings(settings as AppSettings, firebaseUser.uid, firebaseUser.displayName || 'Admin');
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); }
    finally { setIsSaving(false); }
  };

  const update = (key: keyof AppSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <div className="text-center py-20 text-[var(--text-muted)]">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Store Information */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Globe size={18} className="text-blue-600" /> Store Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Store Name</label>
            <input value={settings.storeName || ''} onChange={(e) => update('storeName', e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Store Tagline</label>
            <input value={settings.storeTagline || ''} onChange={(e) => update('storeTagline', e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Store Email</label>
            <input type="email" value={settings.storeEmail || ''} onChange={(e) => update('storeEmail', e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Store Location</label>
            <input value={settings.storeLocation || ''} onChange={(e) => update('storeLocation', e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Contact Configuration */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Phone size={18} className="text-blue-600" /> Contact & WhatsApp
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Display Phone Number
            </label>
            <input
              value={settings.storePhone || ''}
              onChange={(e) => update('storePhone', e.target.value)}
              placeholder="+94 77 123 4567"
              id="settings-phone"
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">Shown on the Contact page and Footer (e.g. +94 77 123 4567)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              WhatsApp Number <span className="text-green-600 font-normal">(for ordering)</span>
            </label>
            <input value={settings.whatsappNumber || ''} onChange={(e) => update('whatsappNumber', e.target.value)}
              placeholder="94771234567 (no spaces, no +)"
              id="settings-whatsapp"
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500" />
            <p className="text-xs text-[var(--text-muted)] mt-1">Include country code without + (e.g., 94771234567) — used for WhatsApp links</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">WhatsApp Order Message Template</label>
            <textarea value={settings.whatsappMessageTemplate || ''} onChange={(e) => update('whatsappMessageTemplate', e.target.value)}
              rows={5} placeholder="Hello Tech Ceylon, I would like to order: {items}"
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-y font-mono" />
          </div>
        </div>
      </div>


      {/* Store Options */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-[var(--text-primary)]">Store Options</h2>
        {[
          { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show a maintenance page to all visitors' },
          { key: 'showOutOfStockProducts', label: 'Show Out-of-Stock Products', desc: 'Display products even when stock = 0' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4 p-3 bg-[var(--bg-secondary)] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
            </div>
            <button
              onClick={() => update(key as keyof AppSettings, !settings[key as keyof AppSettings])}
              className={`w-10 h-6 rounded-full relative transition-all ${settings[key as keyof AppSettings] ? 'bg-blue-600' : 'bg-[var(--bg-tertiary)]'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key as keyof AppSettings] ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button onClick={handleSave} id="save-settings" disabled={isSaving}
        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg">
        <Save size={16} />
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

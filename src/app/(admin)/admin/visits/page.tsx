'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Monitor, Smartphone, Tablet, Globe, User, MapPin, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getAllSiteVisits, SiteVisit } from '@/lib/services/analytics.service';
import { formatDateTime } from '@/lib/utils/formatters';

const PAGE_SIZE = 20;

const DEVICE_ICON = {
  Mobile: <Smartphone size={13} className="inline mr-1 text-green-500" />,
  Tablet: <Tablet size={13} className="inline mr-1 text-purple-500" />,
  Desktop: <Monitor size={13} className="inline mr-1 text-blue-500" />,
};

function DeviceBadge({ type }: { type: string }) {
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
      {DEVICE_ICON[type as keyof typeof DEVICE_ICON] ?? <Monitor size={13} className="inline mr-1 text-blue-500" />}
      {type || 'Desktop'}
    </span>
  );
}

function UserBadge({ userId, userName }: { userId?: string; userName?: string }) {
  const resolvedId = userId ?? 'guest';
  const resolvedName = userName ?? 'Guest';
  const isGuest = resolvedId === 'guest';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isGuest ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600'}`}>
        {isGuest ? <User size={12} /> : resolvedName.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--text-primary)]">{resolvedName}</p>
        {!isGuest && <p className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[100px]">{resolvedId}</p>}
      </div>
    </div>
  );
}

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadVisits = () => {
    setIsLoading(true);
    getAllSiteVisits()
      .then(setVisits)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadVisits(); }, []);

  const filtered = useMemo(() => {
    return visits.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        v.userName.toLowerCase().includes(q) ||
        v.userId.toLowerCase().includes(q) ||
        v.path.toLowerCase().includes(q) ||
        (v.ip || '').includes(q) ||
        (v.country || '').toLowerCase().includes(q) ||
        (v.device?.browser || '').toLowerCase().includes(q) ||
        (v.device?.os || '').toLowerCase().includes(q);
      const matchDevice = !deviceFilter || (v.device?.type || 'Desktop') === deviceFilter;
      const matchUser = !userFilter ||
        (userFilter === 'guest' && v.userId === 'guest') ||
        (userFilter === 'logged_in' && v.userId !== 'guest');
      return matchSearch && matchDevice && matchUser;
    });
  }, [visits, search, deviceFilter, userFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, deviceFilter, userFilter]);

  // Stats
  const totalGuests = visits.filter((v) => v.userId === 'guest').length;
  const totalLoggedIn = visits.filter((v) => v.userId !== 'guest').length;
  const deviceCounts = visits.reduce((acc, v) => {
    const t = v.device?.type || 'Desktop';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Site Visits</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{visits.length} total visits recorded</p>
        </div>
        <button
          onClick={loadVisits}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Visits', value: visits.length, icon: Globe, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30' },
          { label: 'Logged In', value: totalLoggedIn, icon: User, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Guests', value: totalGuests, icon: User, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800/50' },
          { label: 'Desktop', value: deviceCounts['Desktop'] || 0, icon: Monitor, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
          { label: 'Mobile', value: (deviceCounts['Mobile'] || 0) + (deviceCounts['Tablet'] || 0), icon: Smartphone, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-2`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, path, IP, country, browser..."
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
        >
          <option value="">All Devices</option>
          <option value="Desktop">Desktop</option>
          <option value="Mobile">Mobile</option>
          <option value="Tablet">Tablet</option>
        </select>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
        >
          <option value="">All Visitors</option>
          <option value="logged_in">Logged In</option>
          <option value="guest">Guests Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 opacity-40" />
            Loading visits...
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-muted)]">
            <Globe size={32} className="mx-auto mb-3 opacity-30" />
            No visits found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Visitor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Device</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Path</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">IP / Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Referrer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {paginated.map((visit) => (
                  <tr key={visit.visitId} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-5 py-3.5">
                      <UserBadge userId={visit.userId} userName={visit.userName} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <DeviceBadge type={visit.device?.type || 'Desktop'} />
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {visit.device?.os || 'Unknown OS'} · {visit.device?.browser || 'Unknown'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-blue-600 max-w-[150px] truncate">
                      {visit.path}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-1">
                        <MapPin size={11} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-mono text-[var(--text-primary)]">{visit.ip || '—'}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{visit.country || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-[var(--text-muted)] max-w-[120px] truncate">
                      {visit.referrer || <span className="italic">Direct</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {formatDateTime(visit.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination + count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} visits
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="text-xs text-[var(--text-muted)] px-1">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      page === p
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

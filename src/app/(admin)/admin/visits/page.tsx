'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search, Monitor, Smartphone, Tablet, Globe, User, MapPin,
  ChevronLeft, ChevronRight, RefreshCw, LogIn, LogOut, Shield,
} from 'lucide-react';
import { getAllSiteVisits, SiteVisit } from '@/lib/services/analytics.service';
import { getAllLogs } from '@/lib/services/logs.service';
import { Log, LogAction } from '@/types/log.types';
import { formatDateTime } from '@/lib/utils/formatters';

// ─── Unified event type ────────────────────────────────────────────────────────
type EventKind = 'visit' | 'login' | 'logout';

interface UnifiedEvent {
  id: string;
  kind: EventKind;
  timestamp: number;
  userId: string;
  userName: string;
  isAdmin: boolean;
  // visit-only
  path?: string;
  referrer?: string;
  // shared device / location
  device?: { type: string; os: string; browser: string };
  ip?: string;
  country?: string;
}

const LOGIN_ACTIONS: LogAction[] = ['user:login', 'admin:login'];
const LOGOUT_ACTIONS: LogAction[] = ['user:logout', 'admin:logout'];
const AUTH_ACTIONS = [...LOGIN_ACTIONS, ...LOGOUT_ACTIONS];

const PAGE_SIZE = 25;

// ─── Helper sub-components ─────────────────────────────────────────────────────
function DeviceCell({ device }: { device?: { type: string; os: string; browser: string } }) {
  if (!device) return <span className="text-[var(--text-muted)] text-xs">—</span>;
  const Icon = device.type === 'Mobile' ? Smartphone : device.type === 'Tablet' ? Tablet : Monitor;
  const iconColor = device.type === 'Mobile' ? 'text-green-500' : device.type === 'Tablet' ? 'text-purple-500' : 'text-blue-500';
  return (
    <div className="space-y-0.5">
      <span className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
        <Icon size={13} className={iconColor} /> {device.type}
      </span>
      <p className="text-[10px] text-[var(--text-muted)]">{device.os} · {device.browser}</p>
    </div>
  );
}

function IpCell({ ip, country }: { ip?: string; country?: string }) {
  if (!ip || ip === 'Unknown') return <span className="text-[var(--text-muted)] text-xs">—</span>;
  return (
    <div className="flex items-start gap-1">
      <MapPin size={11} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-mono text-[var(--text-primary)]">{ip}</p>
        {country && country !== 'Unknown' && <p className="text-[10px] text-[var(--text-muted)]">{country}</p>}
      </div>
    </div>
  );
}

function EventKindBadge({ kind, isAdmin }: { kind: EventKind; isAdmin: boolean }) {
  if (kind === 'visit') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400">
        <Globe size={10} /> Visit
      </span>
    );
  }
  if (kind === 'login') {
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        isAdmin
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
          : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
      }`}>
        <LogIn size={10} /> {isAdmin ? 'Admin Login' : 'Login'}
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
      isAdmin
        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }`}>
      <LogOut size={10} /> {isAdmin ? 'Admin Logout' : 'Logout'}
    </span>
  );
}

// ─── Converters ────────────────────────────────────────────────────────────────
function visitToEvent(v: SiteVisit): UnifiedEvent {
  return {
    id: v.visitId,
    kind: 'visit',
    timestamp: v.timestamp,
    userId: v.userId ?? 'guest',
    userName: v.userName ?? 'Guest',
    isAdmin: false,
    path: v.path,
    referrer: v.referrer,
    device: v.device,
    ip: v.ip,
    country: v.country,
  };
}

function logToEvent(l: Log): UnifiedEvent {
  const isAdmin = l.action.startsWith('admin:');
  const isLogin = LOGIN_ACTIONS.includes(l.action);
  return {
    id: l.logId,
    kind: isLogin ? 'login' : 'logout',
    timestamp: l.timestamp,
    userId: l.userId,
    userName: l.userName,
    isAdmin,
    device: l.device,
    ip: l.ip,
    country: l.country,
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminVisitsPage() {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'' | EventKind | 'admin'>('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([getAllSiteVisits(), getAllLogs()])
      .then(([visits, logs]) => {
        const visitEvents = visits.map(visitToEvent);
        const authEvents = logs
          .filter((l) => AUTH_ACTIONS.includes(l.action))
          .map(logToEvent);
        const all = [...visitEvents, ...authEvents].sort((a, b) => b.timestamp - a.timestamp);
        setEvents(all);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.userName.toLowerCase().includes(q) ||
        e.userId.toLowerCase().includes(q) ||
        (e.path || '').toLowerCase().includes(q) ||
        (e.ip || '').includes(q) ||
        (e.country || '').toLowerCase().includes(q) ||
        (e.device?.browser || '').toLowerCase().includes(q) ||
        (e.device?.os || '').toLowerCase().includes(q);
      const matchKind = !kindFilter ||
        (kindFilter === 'admin' ? e.isAdmin : e.kind === kindFilter);
      const matchDevice = !deviceFilter || (e.device?.type || 'Desktop') === deviceFilter;
      return matchSearch && matchKind && matchDevice;
    });
  }, [events, search, kindFilter, deviceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, kindFilter, deviceFilter]);

  // Stats
  const visitCount  = events.filter((e) => e.kind === 'visit').length;
  const loginCount  = events.filter((e) => e.kind === 'login').length;
  const logoutCount = events.filter((e) => e.kind === 'logout').length;
  const adminCount  = events.filter((e) => e.isAdmin && e.kind === 'login').length;
  const guestCount  = events.filter((e) => e.userId === 'guest').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Site Visits & Logins</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{events.length} total events recorded</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Page Visits', value: visitCount,  icon: Globe,    color: 'text-sky-600',    bg: 'bg-sky-50 dark:bg-sky-950/30' },
          { label: 'Logins',      value: loginCount,  icon: LogIn,    color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Logouts',     value: logoutCount, icon: LogOut,   color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { label: 'Admin Logins',value: adminCount,  icon: Shield,   color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
          { label: 'Guest Visits',value: guestCount,  icon: User,     color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-gray-800/50' },
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
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}
          className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
        >
          <option value="">All Events</option>
          <option value="visit">Page Visits</option>
          <option value="login">Logins</option>
          <option value="logout">Logouts</option>
          <option value="admin">Admin Only</option>
        </select>
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
      </div>

      {/* Timeline Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 opacity-40" />
            Loading events...
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-muted)]">
            <Globe size={32} className="mx-auto mb-3 opacity-30" />
            No events found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Event</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Visitor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Device</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">IP / Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Path / Detail</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {paginated.map((event) => (
                  <tr key={event.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    {/* Event Kind */}
                    <td className="px-5 py-3.5">
                      <EventKindBadge kind={event.kind} isAdmin={event.isAdmin} />
                    </td>

                    {/* Visitor */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          event.userId === 'guest'
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            : event.isAdmin
                              ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-600'
                              : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600'
                        }`}>
                          {event.userId === 'guest'
                            ? <User size={12} />
                            : event.isAdmin
                              ? <Shield size={12} />
                              : (event.userName ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[110px]">
                            {event.userName ?? 'Guest'}
                          </p>
                          {event.isAdmin && (
                            <p className="text-[10px] text-purple-500">Admin</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Device */}
                    <td className="px-5 py-3.5">
                      <DeviceCell device={event.device} />
                    </td>

                    {/* IP / Location */}
                    <td className="px-5 py-3.5">
                      <IpCell ip={event.ip} country={event.country} />
                    </td>

                    {/* Path or detail */}
                    <td className="px-5 py-3.5">
                      {event.kind === 'visit' ? (
                        <span className="font-mono text-xs text-blue-600">{event.path}</span>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] italic">
                          {event.kind === 'login' ? 'Signed in' : 'Signed out'}
                        </span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="px-5 py-3.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {formatDateTime(event.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">
          Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} events
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:text-[var(--text-primary)]"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`e${i}`} className="text-xs text-[var(--text-muted)] px-1">…</span>
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
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:text-[var(--text-primary)]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

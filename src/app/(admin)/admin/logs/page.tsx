'use client';

import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { getAllLogs } from '@/lib/services/logs.service';
import { Log, LogAction } from '@/types/log.types';
import { formatDateTime, getInitials, stringToColor } from '@/lib/utils/formatters';


const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  LOGIN: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  LOGOUT: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  STATUS_CHANGE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllLogs()
      .then((l) => setLogs(l.sort((a, b) => b.timestamp - a.timestamp)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    const matchSearch = !search || log.userName.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase()) || (log.description || '').toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || log.action.startsWith(actionFilter);
    return matchSearch && matchAction;
  });

  const actionTypes = [...new Set(logs.map((l) => l.action.split(':')[0]))].sort();

  const getActionBadge = (action: string) => {
    const type = action.split(':')[0];
    return ACTION_COLORS[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by user or action..."
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500">
          <option value="">All Actions</option>
          {actionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">Loading logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-muted)]">No logs found</div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {filtered.map((log) => (
              <div key={log.logId} className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: stringToColor(log.userName) }}>
                  {getInitials(log.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-[var(--text-primary)]">{log.userName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                      {log.action.split(':')[0]}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {log.action.replace(':', ': ').replace(/_/g, ' ')}
                    {log.entityName && ` — ${log.entityName}`}
                  </p>
                  {log.description && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{log.description}</p>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] shrink-0 mt-1">{formatDateTime(log.timestamp)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Showing {filtered.length} of {logs.length} log entries
      </p>
    </div>
  );
}

// Logs Service for Tech Ceylon
// Note: This file is imported by other services, so it must not create circular dependencies

import { v4 as uuidv4 } from 'uuid';
import { dbSet, serverTimestamp } from '@/lib/firebase/db';
import { Log, LogAction, LogEntity, LogFilters } from '@/types/log.types';
import { dbGetAll } from '@/lib/firebase/db';

const LOGS_PATH = 'logs';

interface CreateLogParams {
  userId: string;
  userName: string;
  action: LogAction;
  entity: LogEntity;
  entityId?: string;
  details?: Record<string, unknown>;
}

/**
 * Create an audit log entry
 */
export async function createLog(params: CreateLogParams): Promise<void> {
  try {
    const logId = uuidv4();
    const log: Log = {
      logId,
      userId: params.userId,
      userName: params.userName,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || '',
      timestamp: serverTimestamp(),
      details: params.details || {},
    };
    await dbSet(`${LOGS_PATH}/${logId}`, log);
  } catch (error) {
    // Silently fail log writes to not break core operations
    console.error('Failed to write log:', error);
  }
}

/**
 * Get all logs (SUPER_ADMIN only)
 */
export async function getAllLogs(): Promise<Log[]> {
  const all = await dbGetAll<Log>(LOGS_PATH);
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get logs with filters
 */
export async function getFilteredLogs(filters: LogFilters): Promise<Log[]> {
  let logs = await getAllLogs();

  if (filters.action) {
    logs = logs.filter((l) => l.action === filters.action);
  }

  if (filters.entity) {
    logs = logs.filter((l) => l.entity === filters.entity);
  }

  if (filters.userId) {
    logs = logs.filter((l) => l.userId === filters.userId);
  }

  if (filters.startDate) {
    logs = logs.filter((l) => l.timestamp >= filters.startDate!);
  }

  if (filters.endDate) {
    logs = logs.filter((l) => l.timestamp <= filters.endDate!);
  }

  return logs;
}

/**
 * Get recent logs
 */
export async function getRecentLogs(limit = 20): Promise<Log[]> {
  const logs = await getAllLogs();
  return logs.slice(0, limit);
}

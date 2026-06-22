// Log Types for Tech Ceylon

export type LogAction =
  // Admin actions
  | 'admin:login'
  | 'admin:logout'
  | 'admin:add_product'
  | 'admin:edit_product'
  | 'admin:delete_product'
  | 'admin:add_category'
  | 'admin:edit_category'
  | 'admin:delete_category'
  | 'admin:add_admin'
  | 'admin:delete_admin'
  | 'admin:update_settings'
  | 'admin:update_order_status'
  // User actions
  | 'user:login'
  | 'user:logout'
  | 'user:create_order'
  // System actions
  | 'system:error'
  | 'system:security_event';

export type LogEntity =
  | 'product'
  | 'category'
  | 'order'
  | 'admin'
  | 'user'
  | 'settings'
  | 'system';

export interface Log {
  logId: string;
  userId: string;
  userName: string;
  action: LogAction;
  entity: LogEntity;
  entityId?: string;
  entityName?: string;
  description?: string;
  timestamp: number;
  ipAddress?: string;
  details?: Record<string, unknown>;
}

export interface LogFilters {
  action?: LogAction;
  entity?: LogEntity;
  userId?: string;
  startDate?: number;
  endDate?: number;
}

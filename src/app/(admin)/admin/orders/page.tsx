'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { getAllOrders, updateOrderStatus, searchOrders } from '@/lib/services/orders.service';
import { Order, OrderStatus } from '@/types/order.types';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, formatDateTime } from '@/lib/utils/formatters';
import { ORDER_STATUSES } from '@/lib/constants/config';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { firebaseUser, admin } = useAuthStore();

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!firebaseUser) return;
    try {
      await updateOrderStatus(orderId, status, firebaseUser.uid, firebaseUser.displayName || 'Admin');
      setOrders((prev) => prev.map((o) => o.orderId === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.customerInfo.name.toLowerCase().includes(search.toLowerCase()) || o.customerInfo.phone.includes(search) || o.orderId.includes(search);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, order ID..."
            id="admin-order-search"
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Orders */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-muted)]">No orders found</div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {filtered.map((order) => (
              <div key={order.orderId}>
                {/* Order Row */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                  onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[var(--text-primary)]">{order.customerInfo.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{order.customerInfo.phone} · {order.items.length} item(s) · {formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-bold text-[var(--text-primary)]">{formatPrice(order.total)}</p>
                    {/* Status Dropdown */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                        className="appearance-none pl-3 pr-8 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs focus:outline-none"
                      >
                        {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
                    </div>
                    <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${expandedOrder === order.orderId ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrder === order.orderId && (
                  <div className="px-5 pb-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Customer</h4>
                        <p className="text-sm text-[var(--text-primary)]">{order.customerInfo.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{order.customerInfo.phone}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{order.customerInfo.email}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{order.customerInfo.address}</p>
                        {order.customerInfo.notes && (
                          <p className="text-xs text-[var(--text-muted)] mt-1">Note: {order.customerInfo.notes}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.productId} className="flex justify-between text-sm">
                              <span className="text-[var(--text-secondary)]">{item.name} × {item.quantity}</span>
                              <span className="font-medium text-[var(--text-primary)]">{formatPrice(item.subtotal)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold border-t border-[var(--border-color)] pt-2 text-sm">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

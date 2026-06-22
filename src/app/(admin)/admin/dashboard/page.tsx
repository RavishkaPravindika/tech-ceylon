'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Tag, ShoppingBag, Users, Shield, TrendingUp, AlertTriangle, Plus, ArrowRight, Clock } from 'lucide-react';
import { getAllProducts, getLowStockProducts } from '@/lib/services/products.service';
import { getAllCategories } from '@/lib/services/categories.service';
import { getAllOrders, getRecentOrders, getOrdersPerMonth } from '@/lib/services/orders.service';
import { getAllUsers } from '@/lib/services/users.service';
import { getAllAdmins } from '@/lib/services/admins.service';
import { getRecentLogs } from '@/lib/services/logs.service';
import { formatPrice, formatDateTime } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/constants/routes';
import { ORDER_STATUSES } from '@/lib/constants/config';
import { Order } from '@/types/order.types';
import { Product } from '@/types/product.types';
import { Log } from '@/types/log.types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

interface DashboardStats {
  products: number;
  categories: number;
  orders: number;
  users: number;
  admins: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ products: 0, categories: 0, orders: 0, users: 0, admins: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [ordersChart, setOrdersChart] = useState<{ month: string; orders: number; revenue: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [products, categories, orders, users, admins, recent, lowStockItems, chartData, logs] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
          getAllOrders(),
          getAllUsers(),
          getAllAdmins(),
          getRecentOrders(5),
          getLowStockProducts(),
          getOrdersPerMonth(),
          getRecentLogs(5),
        ]);

        setStats({
          products: products.length,
          categories: categories.length,
          orders: orders.length,
          users: users.length,
          admins: admins.length,
        });
        setRecentOrders(recent);
        setLowStock(lowStockItems);
        setOrdersChart(chartData);
        setRecentLogs(logs);
      } catch (err) {
        console.error('Dashboard data error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const STAT_CARDS = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', href: ROUTES.ADMIN_PRODUCTS },
    { label: 'Categories', value: stats.categories, icon: Tag, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', href: ROUTES.ADMIN_CATEGORIES },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', href: ROUTES.ADMIN_ORDERS },
    { label: 'Users', value: stats.users, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', href: ROUTES.ADMIN_ORDERS },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', href: ROUTES.ADMIN_ADMINS },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 shimmer rounded-2xl" />
          <div className="h-64 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <TrendingUp size={14} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-6">Orders & Revenue (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Product', href: ROUTES.ADMIN_PRODUCTS_CREATE, icon: Package, color: 'bg-blue-600 hover:bg-blue-700' },
              { label: 'Add Category', href: ROUTES.ADMIN_CATEGORIES, icon: Tag, color: 'bg-purple-600 hover:bg-purple-700' },
              { label: 'View Orders', href: ROUTES.ADMIN_ORDERS, icon: ShoppingBag, color: 'bg-green-600 hover:bg-green-700' },
              { label: 'View Logs', href: ROUTES.ADMIN_LOGS, icon: Clock, color: 'bg-orange-600 hover:bg-orange-700' },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center justify-center gap-2 p-4 ${color} text-white rounded-xl transition-all text-sm font-medium card-hover`}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </div>

          {/* Low Stock Alert */}
          {lowStock.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={15} className="text-orange-500" />
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                  Low Stock Alert ({lowStock.length} items)
                </p>
              </div>
              <ul className="space-y-1">
                {lowStock.slice(0, 3).map((p) => (
                  <li key={p.productId} className="text-xs text-orange-600 dark:text-orange-400 flex justify-between">
                    <span className="truncate">{p.name}</span>
                    <span className="font-semibold ml-2">{p.stockQuantity} left</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--text-primary)]">Recent Orders</h3>
          <Link href={ROUTES.ADMIN_ORDERS} className="text-xs text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-[var(--text-muted)] text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-secondary)]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Items</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {recentOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--text-primary)]">{order.customerInfo.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{order.customerInfo.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{order.items.length} item(s)</td>
                    <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <h3 className="font-semibold text-[var(--text-primary)]">Recent Activity</h3>
            <Link href={ROUTES.ADMIN_LOGS} className="text-xs text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
              All Logs <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {recentLogs.map((log) => (
              <div key={log.logId} className="px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                  {log.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">
                    <span className="font-medium">{log.userName}</span>{' '}
                    <span className="text-[var(--text-secondary)]">{log.action.replace(':', ' ').replace('_', ' ')}</span>
                  </p>
                </div>
                <p className="text-xs text-[var(--text-muted)] shrink-0">{formatDateTime(log.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

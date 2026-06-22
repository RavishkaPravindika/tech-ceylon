// Orders Service for Tech Ceylon

import { v4 as uuidv4 } from 'uuid';
import { dbSet, dbGet, dbGetAll, dbUpdate, serverTimestamp } from '@/lib/firebase/db';
import { Order, OrderItem, CustomerInfo, OrderStatus } from '@/types/order.types';
import { createLog } from './logs.service';

const ORDERS_PATH = 'orders';

/**
 * Create a new order (before WhatsApp redirect)
 */
export async function createOrder(
  customerInfo: CustomerInfo,
  items: OrderItem[],
  userId?: string | null
): Promise<Order> {
  const orderId = uuidv4();
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const now = serverTimestamp();

  const order: Order = {
    orderId,
    customerInfo,
    items,
    total,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    userId: userId || null,
  };

  await dbSet(`${ORDERS_PATH}/${orderId}`, order);

  // Log the order creation
  if (userId) {
    await createLog({
      userId,
      userName: customerInfo.name,
      action: 'user:create_order',
      entity: 'order',
      entityId: orderId,
      details: { total, itemCount: items.length },
    });
  }

  return order;
}

/**
 * Get an order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  return dbGet<Order>(`${ORDERS_PATH}/${orderId}`);
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders(): Promise<Order[]> {
  const all = await dbGetAll<Order>(ORDERS_PATH);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  updatedBy: string,
  updatedByName: string
): Promise<void> {
  await dbUpdate(`${ORDERS_PATH}/${orderId}`, {
    status,
    updatedAt: serverTimestamp(),
  });

  await createLog({
    userId: updatedBy,
    userName: updatedByName,
    action: 'admin:update_order_status',
    entity: 'order',
    entityId: orderId,
    details: { newStatus: status },
  });
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const all = await getAllOrders();
  return all.filter((o) => o.status === status);
}

/**
 * Get orders for a specific user
 */
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const all = await getAllOrders();
  return all.filter((o) => o.userId === userId);
}

/**
 * Get recent orders
 */
export async function getRecentOrders(limit = 10): Promise<Order[]> {
  const all = await getAllOrders();
  return all.slice(0, limit);
}

/**
 * Get orders per month for chart data (last 6 months)
 */
export async function getOrdersPerMonth(): Promise<{ month: string; orders: number; revenue: number }[]> {
  const all = await getAllOrders();
  const now = new Date();
  const result: { month: string; orders: number; revenue: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthOrders = all.filter(
      (o) => o.createdAt >= date.getTime() && o.createdAt < nextDate.getTime()
    );
    result.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
    });
  }

  return result;
}

/**
 * Search orders
 */
export async function searchOrders(query: string): Promise<Order[]> {
  const all = await getAllOrders();
  const q = query.toLowerCase();
  return all.filter(
    (o) =>
      o.orderId.toLowerCase().includes(q) ||
      o.customerInfo.name.toLowerCase().includes(q) ||
      o.customerInfo.phone.includes(q) ||
      o.customerInfo.email.toLowerCase().includes(q)
  );
}

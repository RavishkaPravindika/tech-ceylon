'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { MessageCircle, User, Phone, Mail, MapPin, FileText, CheckCircle, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils/formatters';
import { createOrder } from '@/lib/services/orders.service';
import { openWhatsApp } from '@/lib/utils/whatsapp';
import { ROUTES } from '@/lib/constants/routes';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { IMAGE_PLACEHOLDER } from '@/lib/constants/config';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Enter a valid phone number').max(15),
  email: z.string().email('Enter a valid email').or(z.literal('')),
  address: z.string().min(5, 'Enter your delivery address'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { items, getCartSummary, clearCart } = useCartStore();
  const { firebaseUser } = useAuthStore();

  const summary = getCartSummary();
  const cartItems = Object.values(items);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: firebaseUser?.displayName || '',
      email: firebaseUser?.email || '',
    },
  });

  if (cartItems.length === 0 && !submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Your cart is empty</h1>
        <Link href={ROUTES.PRODUCTS} className="text-blue-600 hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        productCode: item.productCode,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const customerInfo = {
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        address: data.address,
        notes: data.notes || '',
      };

      // Save order to Firebase
      const order = await createOrder(customerInfo, orderItems, firebaseUser?.uid || null);

      // Open WhatsApp with the order message
      openWhatsApp({ customerInfo, items: orderItems, total: summary.subtotal });

      // Clear cart after successful order
      clearCart();
      setSubmitted(true);

      toast.success('Order sent via WhatsApp!', { icon: '🎉' });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-poppins font-bold text-[var(--text-primary)] mb-3">
          Order Sent via WhatsApp!
        </h1>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          Your order has been recorded and a WhatsApp message has been opened. 
          Our team will confirm your order soon.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={ROUTES.PRODUCTS}
            className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all"
          >
            Continue Shopping
          </Link>
          <Link
            href={ROUTES.HOME}
            className="px-8 py-3.5 border border-[var(--border-color)] text-[var(--text-secondary)] font-medium rounded-2xl hover:bg-[var(--bg-secondary)] transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-poppins font-bold text-[var(--text-primary)] mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Customer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      {...register('name')}
                      id="checkout-name"
                      placeholder="John Doe"
                      className={`w-full pl-9 pr-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all ${errors.name ? 'border-red-400' : 'border-[var(--border-color)]'}`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      {...register('phone')}
                      id="checkout-phone"
                      placeholder="0771234567"
                      className={`w-full pl-9 pr-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all ${errors.phone ? 'border-red-400' : 'border-[var(--border-color)]'}`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Email (optional)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      {...register('email')}
                      id="checkout-email"
                      type="email"
                      placeholder="john@example.com"
                      className={`w-full pl-9 pr-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all ${errors.email ? 'border-red-400' : 'border-[var(--border-color)]'}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3.5 text-[var(--text-muted)]" />
                    <textarea
                      {...register('address')}
                      id="checkout-address"
                      rows={3}
                      placeholder="No. 123, Main Street, Colombo 03"
                      className={`w-full pl-9 pr-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all resize-none ${errors.address ? 'border-red-400' : 'border-[var(--border-color)]'}`}
                    />
                  </div>
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Order Notes (optional)
                  </label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3.5 text-[var(--text-muted)]" />
                    <textarea
                      {...register('notes')}
                      id="checkout-notes"
                      rows={2}
                      placeholder="Please contact me regarding delivery..."
                      className="w-full pl-9 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="submit-whatsapp-order"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl transition-all shadow-xl hover:shadow-green-500/30 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  Send Order via WhatsApp
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Order Summary</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-[var(--bg-secondary)] rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image || IMAGE_PLACEHOLDER}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-1">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.productCode}</p>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] shrink-0">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border-color)] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Delivery</span>
                <span className="text-green-600">On request</span>
              </div>
              <div className="flex justify-between font-bold text-[var(--text-primary)] text-base border-t border-[var(--border-color)] pt-2">
                <span>Total</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400">
              <p className="font-semibold mb-1">📱 How it works:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Fill your details above</li>
                <li>Click &quot;Send Order via WhatsApp&quot;</li>
                <li>WhatsApp opens with your order</li>
                <li>We&apos;ll confirm and arrange delivery</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

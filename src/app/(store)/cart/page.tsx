'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/constants/routes';
import { IMAGE_PLACEHOLDER } from '@/lib/constants/config';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getCartSummary, clearCart } = useCartStore();
  const summary = getCartSummary();
  const cartItems = Object.values(items);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
            <ShoppingBag size={36} className="text-[var(--text-muted)]" />
          </div>
          <h1 className="text-2xl font-poppins font-bold text-[var(--text-primary)] mb-3">
            Your cart is empty
          </h1>
          <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
            Add some products from our catalog to get started with your order.
          </p>
          <Link
            href={ROUTES.PRODUCTS}
            className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
          >
            Browse Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-poppins font-bold text-[var(--text-primary)]">
          Shopping Cart
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 sm:p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl"
            >
              {/* Image */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
                <Image
                  src={item.image || IMAGE_PLACEHOLDER}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={ROUTES.PRODUCT(item.slug || '')}
                  className="text-sm sm:text-base font-semibold text-[var(--text-primary)] hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-[var(--text-muted)] mt-1">{item.productCode}</p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1 w-fit">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-[var(--text-muted)]">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                      <p className="font-bold text-[var(--text-primary)]">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-[var(--text-primary)] text-lg">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Items ({summary.totalItems})</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">On request</span>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-3 flex justify-between font-bold text-[var(--text-primary)]">
              <span>Total</span>
              <span className="text-xl">{formatPrice(summary.subtotal)}</span>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-3 text-xs text-green-700 dark:text-green-400 flex items-start gap-2">
              <MessageCircle size={14} className="shrink-0 mt-0.5" />
              Your order will be processed via WhatsApp. No online payment required.
            </div>

            <Link
              href={ROUTES.CHECKOUT}
              id="cart-checkout-btn"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-green-500/25"
            >
              <MessageCircle size={18} />
              Proceed to WhatsApp Order
            </Link>

            <Link
              href={ROUTES.PRODUCTS}
              className="w-full text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

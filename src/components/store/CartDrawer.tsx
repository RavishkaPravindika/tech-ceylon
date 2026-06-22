'use client';

// Cart Drawer for Tech Ceylon

import { X, ShoppingBag, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { formatPrice } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/constants/routes';
import { IMAGE_PLACEHOLDER } from '@/lib/constants/config';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getCartSummary } = useCartStore();
  const { isCartOpen, closeCart } = useUIStore();

  const summary = getCartSummary();
  const cartItems = Object.values(items);

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[var(--bg-card)] shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600" />
            <h2 className="font-semibold text-[var(--text-primary)]">
              Your Cart
              {summary.totalItems > 0 && (
                <span className="ml-2 text-sm text-[var(--text-muted)]">
                  ({summary.totalItems} item{summary.totalItems !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            id="close-cart-drawer"
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-all text-[var(--text-muted)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-[var(--text-muted)]" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Your cart is empty</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Add some products to get started
              </p>
              <Link
                href={ROUTES.PRODUCTS}
                onClick={closeCart}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]"
              >
                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-tertiary)] shrink-0">
                  <Image
                    src={item.image || IMAGE_PLACEHOLDER}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={ROUTES.PRODUCT(item.slug || '')}
                    onClick={closeCart}
                    className="text-sm font-medium text-[var(--text-primary)] hover:text-blue-600 transition-colors line-clamp-2 leading-tight"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.productCode}</p>
                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 rounded-md hover:bg-[var(--bg-secondary)] transition-all text-[var(--text-muted)]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-[var(--text-primary)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 rounded-md hover:bg-[var(--bg-secondary)] transition-all text-[var(--text-muted)]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 text-[var(--text-muted)] transition-all self-start"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — Order Summary */}
        {cartItems.length > 0 && (
          <div className="border-t border-[var(--border-color)] px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Subtotal</span>
              <span className="font-bold text-lg text-[var(--text-primary)]">
                {formatPrice(summary.subtotal)}
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 flex items-start gap-2">
              <MessageCircle size={15} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Orders are placed via WhatsApp. No online payment required.
              </p>
            </div>

            <Link
              href={ROUTES.CHECKOUT}
              onClick={closeCart}
              id="proceed-to-checkout"
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/25"
            >
              <MessageCircle size={18} />
              Order via WhatsApp
            </Link>

            <Link
              href={ROUTES.CART}
              onClick={closeCart}
              className="w-full py-2.5 text-sm text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              View Cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

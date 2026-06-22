'use client';

// Cart Store (Zustand) for Tech Ceylon
// Handles both localStorage (guest) and Firebase (logged-in user) sync

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, CartSummary } from '@/types/cart.types';
import { Product } from '@/types/product.types';

interface CartStore {
  items: Record<string, CartItem>;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  getCartSummary: () => CartSummary;
  getItemCount: () => number;
  hasItem: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: {},

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items[product.productId];
          const effectivePrice = product.discountPrice ?? product.price;
          const newQty = existing ? existing.quantity + quantity : quantity;

          return {
            items: {
              ...state.items,
              [product.productId]: {
                productId: product.productId,
                name: product.name,
                productCode: product.productCode,
                price: effectivePrice,
                discountPrice: product.discountPrice,
                quantity: newQty,
                subtotal: effectivePrice * newQty,
                image: product.images[0],
                slug: product.slug,
              },
            },
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[productId];
          return { items: newItems };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => {
          const item = state.items[productId];
          if (!item) return state;
          return {
            items: {
              ...state.items,
              [productId]: {
                ...item,
                quantity,
                subtotal: item.price * quantity,
              },
            },
          };
        });
      },

      clearCart: () => {
        set({ items: {} });
      },

      getCartSummary: (): CartSummary => {
        const items = Object.values(get().items);
        return {
          itemCount: items.length,
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
        };
      },

      getItemCount: () => {
        return Object.values(get().items).reduce((sum, item) => sum + item.quantity, 0);
      },

      hasItem: (productId: string) => {
        return productId in get().items;
      },
    }),
    {
      name: 'tech-ceylon-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

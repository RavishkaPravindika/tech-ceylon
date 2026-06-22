'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Zap, Eye } from 'lucide-react';
import { Product } from '@/types/product.types';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { formatPrice, calcDiscountPercent } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/constants/routes';
import toast from 'react-hot-toast';
import { IMAGE_PLACEHOLDER } from '@/lib/constants/config';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addItem, hasItem } = useCartStore();
  const { openCart } = useUIStore();

  const effectivePrice = product.discountPrice ?? product.price;
  const discountPercent =
    product.discountPrice ? calcDiscountPercent(product.price, product.discountPrice) : 0;
  const inCart = hasItem(product.productId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
    });
  };

  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCart();
  };

  const isOutOfStock = product.status === 'out_of_stock' || product.stockQuantity === 0;

  return (
    <Link
      href={ROUTES.PRODUCT(product.slug)}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden card-hover"
      id={`product-card-${product.productId}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[var(--bg-secondary)] overflow-hidden">
        <Image
          src={product.images[0] || IMAGE_PLACEHOLDER}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-lg">
              <Star size={10} fill="currentColor" /> Featured
            </span>
          )}
          {discountPercent > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-1 bg-gray-700/80 text-white text-xs font-medium rounded-lg">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick action overlay */}
        <div className="absolute inset-0 bg-blue-900/10 dark:bg-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <span className="flex items-center gap-1 text-xs text-white bg-blue-700/80 px-3 py-1.5 rounded-full font-medium">
            <Eye size={12} /> View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {categoryName && (
          <p className="text-xs text-blue-500 font-medium mb-1 uppercase tracking-wider">{categoryName}</p>
        )}
        <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-3">Code: {product.productCode}</p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold text-[var(--text-primary)]">
            {formatPrice(effectivePrice)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-[var(--text-muted)] line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {isOutOfStock ? (
          <button
            disabled
            className="w-full py-2.5 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-xl cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : inCart ? (
          <button
            onClick={handleViewCart}
            className="w-full py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Zap size={14} /> View in Cart
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            id={`add-to-cart-${product.productId}`}
            className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/30"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
      <div className="aspect-square shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 shimmer rounded-md" />
        <div className="h-4 w-full shimmer rounded-md" />
        <div className="h-3 w-2/3 shimmer rounded-md" />
        <div className="h-5 w-1/2 shimmer rounded-md" />
        <div className="h-10 w-full shimmer rounded-xl" />
      </div>
    </div>
  );
}

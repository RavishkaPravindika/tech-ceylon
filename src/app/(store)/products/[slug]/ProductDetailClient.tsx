'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, MessageCircle, Star, Shield, Package, Minus, Plus, Zap } from 'lucide-react';
import { Product } from '@/types/product.types';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { formatPrice, calcDiscountPercent } from '@/lib/utils/formatters';
import { IMAGE_PLACEHOLDER, WHATSAPP_NUMBER } from '@/lib/constants/config';
import { generateWhatsAppURL } from '@/lib/utils/whatsapp';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  categoryName?: string;
}

export function ProductDetailClient({ product, categoryName }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, hasItem, getCartSummary } = useCartStore();
  const { openCart } = useUIStore();

  const inCart = hasItem(product.productId);
  const effectivePrice = product.discountPrice ?? product.price;
  const discountPercent = product.discountPrice
    ? calcDiscountPercent(product.price, product.discountPrice)
    : 0;
  const isOutOfStock = product.status === 'out_of_stock' || product.stockQuantity === 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, quantity);
    }
    toast.success(`${quantity}x ${product.name} added to cart!`);
    openCart();
  };

  const handleBuyNow = () => {
    const message = {
      customerInfo: { name: 'Customer', phone: '', email: '', address: '', notes: `Interested in: ${product.name}` },
      items: [{
        productId: product.productId,
        name: product.name,
        productCode: product.productCode,
        price: effectivePrice,
        quantity,
        subtotal: effectivePrice * quantity,
      }],
      total: effectivePrice * quantity,
    };
    const url = generateWhatsAppURL(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const images = product.images.length > 0 ? product.images : [IMAGE_PLACEHOLDER];

  return (
    <>
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-color)]">
          <Image
            src={images[selectedImage]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {discountPercent > 0 && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-xl">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-blue-600 shadow-md'
                    : 'border-[var(--border-color)] hover:border-blue-300'
                }`}
              >
                <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {categoryName && (
          <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">{categoryName}</p>
        )}

        <div>
          <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-[var(--text-primary)] leading-tight mb-2">
            {product.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Code: <span className="font-mono font-medium">{product.productCode}</span></p>
          {product.brand && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">Brand: <span className="font-medium text-[var(--text-secondary)]">{product.brand}</span></p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-[var(--text-primary)]">
            {formatPrice(effectivePrice)}
          </span>
          {product.discountPrice && (
            <span className="text-lg text-[var(--text-muted)] line-through">
              {formatPrice(product.price)}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-950/40 text-red-600 text-xs font-bold rounded-lg">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-[var(--text-secondary)] leading-relaxed">{product.shortDescription}</p>
        )}

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
          <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
            {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stockQuantity} available)`}
          </span>
        </div>

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Quantity:</span>
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isOutOfStock ? (
            <button disabled className="flex-1 py-3.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-2xl font-semibold cursor-not-allowed border border-[var(--border-color)]">
              Out of Stock
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                id="product-add-to-cart"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
              >
                <ShoppingCart size={18} />
                {inCart ? 'Add More to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                id="product-whatsapp-order"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-green-500/30 active:scale-95"
              >
                <MessageCircle size={18} />
                Order via WhatsApp
              </button>
            </>
          )}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { icon: Shield, label: 'Genuine Product', color: 'text-blue-500' },
            { icon: MessageCircle, label: 'WhatsApp Support', color: 'text-green-500' },
            { icon: Package, label: 'Secure Packaging', color: 'text-purple-500' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-[var(--bg-secondary)] rounded-xl text-center">
              <Icon size={18} className={color} />
              <span className="text-xs text-[var(--text-muted)] leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {product.description && (
          <div className="pt-4 border-t border-[var(--border-color)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Description</h3>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

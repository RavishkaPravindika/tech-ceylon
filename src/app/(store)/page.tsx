export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, MessageCircle, Zap, Star } from 'lucide-react';
import { getActiveProducts, getFeaturedProducts } from '@/lib/services/products.service';
import { getActiveCategories } from '@/lib/services/categories.service';
import { getSettings } from '@/lib/services/settings.service';
import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings.types';
import { ProductCard } from '@/components/store/ProductCard';
import { ROUTES } from '@/lib/constants/routes';
import { APP_NAME } from '@/lib/constants/config';

export const metadata: Metadata = {
  title: `${APP_NAME} — Premium Tech Products`,
  description: 'Discover the latest electronics, accessories, and gadgets. Order easily via WhatsApp.',
};

const FEATURES = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Ordering',
    description: 'Order directly via WhatsApp. No checkout hassle, no payment forms.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    icon: Shield,
    title: 'Trusted Products',
    description: 'All products are genuine and quality-verified before listing.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Truck,
    title: 'Island-wide Delivery',
    description: 'Fast delivery across Sri Lanka. Contact us for shipping details.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    icon: Zap,
    title: 'Instant Response',
    description: 'Quick replies on WhatsApp during business hours.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
  },
];

export default async function HomePage() {
  // Fetch data server-side
  let featured: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let categories: Awaited<ReturnType<typeof getActiveCategories>> = [];
  let settings: AppSettings = DEFAULT_SETTINGS;

  try {
    [featured, categories, settings] = await Promise.all([
      getFeaturedProducts(8),
      getActiveCategories(),
      getSettings(),
    ]) as [Awaited<ReturnType<typeof getFeaturedProducts>>, Awaited<ReturnType<typeof getActiveCategories>>, AppSettings];
  } catch {
    // Firebase not configured — show empty state gracefully
  }

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-hero-gradient overflow-hidden min-h-[85vh] flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-blue-200 text-sm font-medium mb-8 animate-fade-in">
            <Star size={14} fill="currentColor" className="text-yellow-400" />
            Sri Lanka&apos;s Premium Tech Store
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-poppins font-bold text-white mb-6 leading-tight animate-fade-in">
            Tech That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">
              Elevates
            </span>{' '}
            You
          </h1>

          <p className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
            Discover premium electronics, accessories, and gadgets at the best prices in Sri Lanka.
            Place orders instantly via WhatsApp — no complicated checkout.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              href={ROUTES.PRODUCTS}
              id="hero-shop-now"
              className="flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-white/20 text-base"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link
              href={ROUTES.CATEGORIES}
              className="flex items-center gap-2 px-8 py-4 glass text-white font-semibold rounded-2xl hover:bg-white/15 transition-all text-base"
            >
              Browse Categories
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in">
            {[
              { label: settings.heroStat1Label || 'Products', value: settings.heroStat1Value || '200+' },
              { label: settings.heroStat2Label || 'Happy Customers', value: settings.heroStat2Value || '1K+' },
              { label: settings.heroStat3Label || 'Categories', value: settings.heroStat3Value || '10+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-blue-200/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl card-hover"
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon size={22} className={feature.color} />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-[var(--text-primary)]">
                Shop by Category
              </h2>
              <p className="text-[var(--text-secondary)] mt-1">Explore our curated tech categories</p>
            </div>
            <Link
              href={ROUTES.CATEGORIES}
              className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:gap-3 transition-all"
            >
              All Categories <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.categoryId}
                href={`${ROUTES.PRODUCTS}?category=${category.categoryId}`}
                id={`category-${category.categoryId}`}
                className="group flex flex-col items-center p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg card-hover text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📦</span>
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-blue-600 transition-colors line-clamp-2">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="bg-[var(--bg-secondary)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-[var(--text-primary)]">
                Featured Products
              </h2>
              <p className="text-[var(--text-secondary)] mt-1">Hand-picked premium selections</p>
            </div>
            <Link
              href={ROUTES.PRODUCTS}
              className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:gap-3 transition-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap size={28} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-secondary)]">Products will appear here once added.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Configure Firebase to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative bg-brand-gradient rounded-3xl p-8 sm:p-12 overflow-hidden text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-4xl font-poppins font-bold text-white mb-4">
              Ready to Order?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Browse our full catalog, add items to your cart, and place your order via WhatsApp in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={ROUTES.PRODUCTS}
                id="cta-browse-products"
                className="flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl"
              >
                Browse Products <ArrowRight size={18} />
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94771234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                id="cta-whatsapp"
                className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-2xl transition-all shadow-xl"
              >
                <MessageCircle size={18} /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

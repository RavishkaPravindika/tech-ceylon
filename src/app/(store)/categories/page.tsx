export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveCategories } from '@/lib/services/categories.service';
import { getActiveProducts } from '@/lib/services/products.service';
import { ROUTES } from '@/lib/constants/routes';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all product categories at Tech Ceylon.',
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getActiveCategories>> = [];
  let productCountMap: Record<string, number> = {};

  try {
    const [cats, products] = await Promise.all([getActiveCategories(), getActiveProducts()]);
    categories = cats;
    products.forEach((p) => {
      productCountMap[p.categoryId] = (productCountMap[p.categoryId] || 0) + 1;
    });
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-bold text-[var(--text-primary)]">Categories</h1>
        <p className="text-[var(--text-secondary)] mt-1">Browse our product categories</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">No categories yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.categoryId}
              href={`${ROUTES.PRODUCTS}?category=${cat.categoryId}`}
              id={`category-link-${cat.categoryId}`}
              className="group flex flex-col items-center p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg card-hover text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📦</span>
              </div>
              <h2 className="font-semibold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors mb-1">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">{cat.description}</p>
              )}
              <span className="text-xs text-blue-600 font-medium">
                {productCountMap[cat.categoryId] || 0} products
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

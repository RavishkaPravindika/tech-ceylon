export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getActiveProducts } from '@/lib/services/products.service';
import { getActiveCategories } from '@/lib/services/categories.service';
import { ProductsClient } from './ProductsClient';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our full catalog of premium tech products. Filter by category, brand, and price.',
};

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof getActiveProducts>> = [];
  let categories: Awaited<ReturnType<typeof getActiveCategories>> = [];

  try {
    [products, categories] = await Promise.all([
      getActiveProducts(),
      getActiveCategories(),
    ]);
  } catch {
    // Firebase not configured
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-bold text-[var(--text-primary)]">All Products</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProductsClient products={products} categories={categories} />
      </Suspense>
    </div>
  );
}

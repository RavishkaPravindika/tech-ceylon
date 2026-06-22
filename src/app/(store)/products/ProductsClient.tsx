'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Package } from 'lucide-react';
import { Product } from '@/types/product.types';
import { Category } from '@/types/category.types';
import { ProductCard, ProductCardSkeleton } from '@/components/store/ProductCard';
import { filterAndSortProducts } from '@/lib/services/products.service';
import { SORT_OPTIONS, PAGINATION } from '@/lib/constants/config';
import { formatPrice } from '@/lib/utils/formatters';

interface ProductsClientProps {
  products: Product[];
  categories: Category[];
}

const PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE;

export function ProductsClient({ products, categories }: ProductsClientProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Get unique brands
  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  // Category map for display
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => (map[c.categoryId] = c.name));
    return map;
  }, [categories]);

  // Apply filters and sort
  const filtered = useMemo(() => {
    return filterAndSortProducts(
      products,
      {
        search: debouncedSearch,
        categoryId: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        inStock: inStockOnly || undefined,
        featured: featuredOnly || undefined,
      },
      sort
    );
  }, [products, debouncedSearch, selectedCategory, selectedBrand, minPrice, maxPrice, inStockOnly, featuredOnly, sort]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters = selectedCategory || selectedBrand || minPrice || maxPrice || inStockOnly || featuredOnly;

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSearch('');
    setPage(1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ===== SIDEBAR FILTERS ===== */}
      <aside className={`lg:w-64 shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="sticky top-24 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X size={12} /> Clear All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              Category
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  !selectedCategory
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => { setSelectedCategory(cat.categoryId); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === cat.categoryId
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {brands.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="space-y-3">
            {[
              { label: 'In Stock Only', value: inStockOnly, set: setInStockOnly },
              { label: 'Featured Only', value: featuredOnly, set: setFeaturedOnly },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => { set(!value); setPage(1); }}
                  className={`w-9 h-5 rounded-full relative transition-all ${
                    value ? 'bg-blue-600' : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      value ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search products, codes, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="product-search"
              className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              id="product-sort"
              className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)]"
          >
            <SlidersHorizontal size={16} />
            Filters {hasActiveFilters && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
          </button>
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Showing {paginated.length} of {filtered.length} products
          {debouncedSearch && ` for "${debouncedSearch}"`}
        </p>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-4">
              <Package size={32} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">No products found</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginated.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                categoryName={categoryMap[product.categoryId]}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && arr[idx - 1] !== p - 1;
                return (
                  <span key={p}>
                    {showEllipsis && <span className="px-2 text-[var(--text-muted)]">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === p
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

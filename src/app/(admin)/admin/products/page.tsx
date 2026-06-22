'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAllProducts, deleteProduct, updateProductStatus } from '@/lib/services/products.service';
import { getAllCategories } from '@/lib/services/categories.service';
import { Product, ProductStatus } from '@/types/product.types';
import { Category } from '@/types/category.types';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, formatDateTime } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/constants/routes';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<ProductStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  out_of_stock: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { firebaseUser } = useAuthStore();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([getAllProducts(), getAllCategories()]);
      setProducts(prods.sort((a, b) => b.createdAt - a.createdAt));
      setCategories(cats);
    } catch { toast.error('Failed to load products'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.categoryId, c.name]));

  const filtered = products.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.productCode.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (productId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteProduct(productId, firebaseUser.uid, firebaseUser.displayName || 'Admin');
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch { toast.error('Failed to delete product'); }
    finally { setConfirmDelete(null); }
  };

  const handleToggleStatus = async (product: Product) => {
    if (!firebaseUser) return;
    const newStatus: ProductStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await updateProductStatus(product.productId, newStatus, firebaseUser.uid);
      setProducts((prev) => prev.map((p) => p.productId === product.productId ? { ...p, status: newStatus } : p));
      toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            id="admin-product-search"
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
          />
        </div>
        <Link
          href={ROUTES.ADMIN_PRODUCTS_CREATE}
          id="create-product-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-[var(--text-muted)] mb-4">No products found</p>
            <Link href={ROUTES.ADMIN_PRODUCTS_CREATE} className="text-sm text-blue-600 hover:underline">
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  {['Product', 'Code', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filtered.map((product) => (
                  <tr key={product.productId} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--text-primary)] max-w-[200px] truncate">{product.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{product.brand}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-[var(--text-secondary)]">{product.productCode}</td>
                    <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">{categoryMap[product.categoryId] || '—'}</td>
                    <td className="px-5 py-4 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                      {formatPrice(product.discountPrice ?? product.price)}
                      {product.discountPrice && (
                        <span className="ml-1 text-xs text-[var(--text-muted)] line-through">{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${product.stockQuantity <= 5 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[product.status]}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={ROUTES.PRODUCT(product.slug)}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-blue-600 transition-all"
                          title="View"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={ROUTES.ADMIN_PRODUCTS_EDIT(product.productId)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-green-600 transition-all"
                          title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {product.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(product.productId)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Delete Product?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              This will archive the product and remove it from the store. This action can be reversed by an admin.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl text-sm font-medium hover:bg-[var(--bg-secondary)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                id="confirm-delete-product"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

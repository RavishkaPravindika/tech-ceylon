'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '@/lib/services/categories.service';
import { Category, CategoryFormData } from '@/types/category.types';
import { useAuthStore } from '@/store/authStore';
import { formatDateTime } from '@/lib/utils/formatters';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '', image: '', status: 'active' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { firebaseUser } = useAuthStore();

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try { setCategories(await getAllCategories()); }
    catch { toast.error('Failed to load categories'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const resetForm = () => { setFormData({ name: '', description: '', image: '', status: 'active' }); setEditingCat(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !formData.name) return;
    setIsSubmitting(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.categoryId, formData, firebaseUser.uid, firebaseUser.displayName || 'Admin');
        toast.success('Category updated');
      } else {
        await createCategory(formData, firebaseUser.uid, firebaseUser.displayName || 'Admin');
        toast.success('Category created');
      }
      await loadCategories();
      resetForm();
    } catch { toast.error('Operation failed'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (catId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteCategory(catId, firebaseUser.uid, firebaseUser.displayName || 'Admin');
      setCategories((prev) => prev.filter((c) => c.categoryId !== catId));
      toast.success('Category deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setConfirmDelete(null); }
  };

  const handleToggle = async (cat: Category) => {
    if (!firebaseUser) return;
    const newStatus = cat.status === 'active' ? 'inactive' as const : 'active' as const;
    try {
      await toggleCategoryStatus(cat.categoryId, newStatus, firebaseUser.uid);
      setCategories((prev) => prev.map((c) => c.categoryId === cat.categoryId ? { ...c, status: newStatus } : c));
      toast.success(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-end">
        <button onClick={() => { resetForm(); setShowForm(true); }} id="add-category-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">{editingCat ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Name *</label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Keyboards"
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Image URL</label>
              <input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..."
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
              <input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description"
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl text-sm hover:bg-[var(--bg-secondary)] transition-all">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-all">
                {isSubmitting ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-muted)]">No categories yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                {['Name', 'Slug', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {categories.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[var(--text-primary)]">{cat.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate max-w-[180px]">{cat.description}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-secondary)]">{cat.slug}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--text-muted)]">{formatDateTime(cat.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingCat(cat); setFormData({ name: cat.name, description: cat.description, image: cat.image, status: cat.status }); setShowForm(true); }}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-blue-600 transition-all">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleToggle(cat)} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-green-600 transition-all">
                        {cat.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>
                      <button onClick={() => setConfirmDelete(cat.categoryId)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Delete Category?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">This will permanently delete the category. Products in this category will not be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl text-sm hover:bg-[var(--bg-secondary)] transition-all">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} id="confirm-delete-cat" className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

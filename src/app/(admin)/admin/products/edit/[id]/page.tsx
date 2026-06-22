'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Minus, Upload, X, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getAllCategories } from '@/lib/services/categories.service';
import { getProductById, updateProduct } from '@/lib/services/products.service';
import { uploadProductImage } from '@/lib/firebase/storage';
import { Category } from '@/types/category.types';
import { Product } from '@/types/product.types';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants/routes';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  productCode: z.string().min(2, 'Product code is required'),
  shortDescription: z.string().min(10, 'Short description required'),
  description: z.string().min(20, 'Full description required'),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  price: z.coerce.number().positive('Price must be positive'),
  discountPrice: z.coerce.number().positive().optional().or(z.literal('')),
  stockQuantity: z.coerce.number().int().min(0),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'draft', 'out_of_stock', 'archived']),
  images: z.array(z.string()),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })),
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { firebaseUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'active',
      featured: false,
      images: [],
      specifications: [{ key: '', value: '' }],
      stockQuantity: 0,
    },
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'specifications',
  });
  const images = watch('images');

  // Load product and categories
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [prod, cats] = await Promise.all([
          getProductById(productId),
          getAllCategories(),
        ]);

        if (!prod) {
          toast.error('Product not found');
          router.push(ROUTES.ADMIN_PRODUCTS);
          return;
        }

        setProduct(prod);
        setCategories(cats);

        // Pre-populate the form
        reset({
          name: prod.name,
          productCode: prod.productCode,
          shortDescription: prod.shortDescription,
          description: prod.description,
          categoryId: prod.categoryId,
          brand: prod.brand,
          price: prod.price,
          discountPrice: prod.discountPrice ?? '',
          stockQuantity: prod.stockQuantity,
          featured: prod.featured,
          status: prod.status,
          images: prod.images ?? [],
          specifications:
            prod.specifications && prod.specifications.length > 0
              ? prod.specifications
              : [{ key: '', value: '' }],
        });
      } catch {
        toast.error('Failed to load product');
        router.push(ROUTES.ADMIN_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [productId, reset, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingImages(true);
    try {
      const urls = await Promise.all(
        files.map((file) => uploadProductImage(file, productId))
      );
      setValue('images', [...images, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (idx: number) => {
    setValue('images', images.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: ProductForm) => {
    if (!firebaseUser) return;
    setIsSubmitting(true);
    try {
      const productData = {
        ...data,
        discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
        price: Number(data.price),
        stockQuantity: Number(data.stockQuantity),
        specifications: data.specifications.filter((s) => s.key && s.value),
      };
      await updateProduct(
        productId,
        productData as any,
        firebaseUser.uid,
        firebaseUser.displayName || 'Admin'
      );
      toast.success('Product updated successfully!');
      router.push(ROUTES.ADMIN_PRODUCTS);
    } catch {
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--text-muted)]">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.ADMIN_PRODUCTS}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      {product && (
        <div className="flex items-center gap-3">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover border border-[var(--border-color)]"
            />
          )}
          <div>
            <h1 className="font-semibold text-[var(--text-primary)]">
              Editing: <span className="text-blue-600">{product.name}</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)]">ID: {product.productId}</p>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-[var(--text-primary)]">Product Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Product Name *
            </label>
            <input
              {...register('name')}
              id="product-name"
              placeholder="e.g. Wireless Mechanical Keyboard"
              className={`w-full px-4 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 ${errors.name ? 'border-red-400' : 'border-[var(--border-color)]'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Product Code */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Product Code *
            </label>
            <input
              {...register('productCode')}
              id="product-code"
              placeholder="e.g. TK-001"
              className={`w-full px-4 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 ${errors.productCode ? 'border-red-400' : 'border-[var(--border-color)]'}`}
            />
            {errors.productCode && (
              <p className="text-xs text-red-500 mt-1">{errors.productCode.message}</p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Brand *
            </label>
            <input
              {...register('brand')}
              id="product-brand"
              placeholder="e.g. Logitech"
              className={`w-full px-4 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 ${errors.brand ? 'border-red-400' : 'border-[var(--border-color)]'}`}
            />
            {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Category *
            </label>
            <select
              {...register('categoryId')}
              id="product-category"
              className={`w-full px-4 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 ${errors.categoryId ? 'border-red-400' : 'border-[var(--border-color)]'}`}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Status
            </label>
            <select
              {...register('status')}
              id="product-status"
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Price (Rs.) *
            </label>
            <input
              {...register('price')}
              type="number"
              id="product-price"
              placeholder="0"
              className={`w-full px-4 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 ${errors.price ? 'border-red-400' : 'border-[var(--border-color)]'}`}
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
          </div>

          {/* Discount Price */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Discount Price (Rs.) — optional
            </label>
            <input
              {...register('discountPrice')}
              type="number"
              id="product-discount-price"
              placeholder="Leave empty if no discount"
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Stock Quantity
            </label>
            <input
              {...register('stockQuantity')}
              type="number"
              id="product-stock"
              placeholder="0"
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3 pt-6">
            <input
              {...register('featured')}
              type="checkbox"
              id="product-featured"
              className="w-4 h-4 accent-blue-600"
            />
            <label
              htmlFor="product-featured"
              className="text-sm font-medium text-[var(--text-secondary)] cursor-pointer"
            >
              Featured Product (shown on homepage)
            </label>
          </div>

          {/* Short Description */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Short Description *
            </label>
            <textarea
              {...register('shortDescription')}
              id="product-short-desc"
              rows={2}
              placeholder="Brief product summary"
              className={`w-full px-4 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 resize-none ${errors.shortDescription ? 'border-red-400' : 'border-[var(--border-color)]'}`}
            />
            {errors.shortDescription && (
              <p className="text-xs text-red-500 mt-1">{errors.shortDescription.message}</p>
            )}
          </div>

          {/* Full Description */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Full Description *
            </label>
            <textarea
              {...register('description')}
              id="product-desc"
              rows={5}
              placeholder="Detailed product description"
              className={`w-full px-4 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 resize-y ${errors.description ? 'border-red-400' : 'border-[var(--border-color)]'}`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-[var(--text-primary)]">Product Images</h2>
        <div className="flex flex-wrap gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--border-color)]"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <label
            className={`w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploadingImages ? (
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            ) : (
              <>
                <Upload size={18} className="text-[var(--text-muted)] mb-1" />
                <span className="text-xs text-[var(--text-muted)]">Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImages}
            />
          </label>
        </div>
        <p className="text-xs text-[var(--text-muted)]">Or paste image URLs directly:</p>
        <input
          type="text"
          placeholder="https://example.com/image.jpg (press Enter)"
          className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const val = (e.target as HTMLInputElement).value.trim();
              if (val) {
                setValue('images', [...images, val]);
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
      </div>

      {/* Specifications */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--text-primary)]">Specifications</h2>
          <button
            type="button"
            onClick={() => appendSpec({ key: '', value: '' })}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Plus size={14} /> Add Row
          </button>
        </div>
        <div className="space-y-2">
          {specFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`specifications.${idx}.key`)}
                placeholder="e.g. Connectivity"
                className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                {...register(`specifications.${idx}.value`)}
                placeholder="e.g. Bluetooth 5.0"
                className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
              {specFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Minus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pb-8">
        <Link
          href={ROUTES.ADMIN_PRODUCTS}
          className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl text-sm font-medium hover:bg-[var(--bg-secondary)] transition-all"
        >
          Cancel
        </Link>
        <button
          type="submit"
          id="edit-product-submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

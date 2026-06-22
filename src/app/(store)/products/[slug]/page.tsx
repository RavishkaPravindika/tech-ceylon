export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug, getActiveProducts } from '@/lib/services/products.service';
import { getCategoryById } from '@/lib/services/categories.service';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductCard } from '@/components/store/ProductCard';
import { formatPrice, calcDiscountPercent } from '@/lib/utils/formatters';
import { APP_URL } from '@/lib/constants/config';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: 'Product Not Found' };

    return {
      title: product.name,
      description: product.shortDescription || product.description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.shortDescription || product.description.slice(0, 160),
        images: product.images[0] ? [{ url: product.images[0] }] : [],
        type: 'website',
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof getProductBySlug>> = null;
  let categoryName = '';
  let related: Awaited<ReturnType<typeof getActiveProducts>> = [];

  try {
    product = await getProductBySlug(slug);
    if (!product) notFound();

    const [cat, allActive] = await Promise.all([
      getCategoryById(product.categoryId),
      getActiveProducts(),
    ]);

    categoryName = cat?.name || '';
    related = allActive
      .filter((p) => p.categoryId === product!.categoryId && p.productId !== product!.productId)
      .slice(0, 4);
  } catch {
    notFound();
  }

  if (!product) notFound();

  const effectivePrice = product.discountPrice ?? product.price;
  const discountPercent = product.discountPrice
    ? calcDiscountPercent(product.price, product.discountPrice)
    : 0;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.productCode,
    brand: { '@type': 'Brand', name: product.brand },
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: effectivePrice,
      priceCurrency: 'LKR',
      availability:
        product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${APP_URL}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-blue-600 transition-colors">Products</a>
          {categoryName && (
            <>
              <span>/</span>
              <span className="text-blue-600">{categoryName}</span>
            </>
          )}
          <span>/</span>
          <span className="text-[var(--text-primary)] truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images — Client component handles gallery */}
          <ProductDetailClient product={product} categoryName={categoryName} />
        </div>

        {/* Specifications */}
        {product.specifications.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-poppins font-bold text-[var(--text-primary)] mb-6">
              Specifications
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
              {product.specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-6 py-4 ${
                    idx % 2 === 0 ? 'bg-[var(--bg-secondary)]' : ''
                  } ${idx !== product!.specifications.length - 1 ? 'border-b border-[var(--border-color)]' : ''}`}
                >
                  <span className="text-sm font-medium text-[var(--text-secondary)] w-40 shrink-0">
                    {spec.key}
                  </span>
                  <span className="text-sm text-[var(--text-primary)]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-poppins font-bold text-[var(--text-primary)] mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.productId} product={p} categoryName={categoryName} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

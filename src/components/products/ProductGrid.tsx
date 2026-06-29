import React from 'react';
import ProductCard from '../ProductCard';
import ProductCardSkeleton from '../ProductCardSkeleton';
import { ProductDTO } from '../../types/product';
import './ProductGrid.css';

interface ProductGridProps {
  products: ProductDTO[];
  isLoading: boolean;
  emptyState: React.ReactNode;
}

export default function ProductGrid({ products, isLoading, emptyState }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="product-grid-layout">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="product-grid-empty-wrap">{emptyState}</div>;
  }

  return (
    <div className="product-grid-layout">
      {products.map((prod) => {
        // Map database fields to front-end schema expected by ProductCard
        const mappedProduct = {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          subtitle: prod.description ? prod.description.slice(0, 80) + '...' : '',
          category: prod.category?.name || 'Coffee',
          roast: prod.roast || 'Medium',
          image: prod.images[0] || '/placeholder.png',
          // Convert paise to INR
          price: prod.salePrice ? prod.salePrice / 100 : prod.price / 100,
          originalPrice: prod.salePrice ? prod.price / 100 : undefined,
          weight: prod.weight || '50g',
          rating: 4.8, // Default rating fallback
          reviewCount: 24, // Default review count fallback
          inStock: prod.stock > 0,
          isNew: prod.isNew,
          isBestseller: prod.isBestseller,
          isLimited: prod.isLimited,
          limitedQty: prod.limitedQty || 200,
          remainingQty: prod.stock,
          stripColor: prod.roast === 'Dark' ? '#240b00' : prod.roast === 'Light' ? '#ff4d6d' : '#8e5e38',
        };

        return <ProductCard key={prod.id} product={mappedProduct} />;
      })}
    </div>
  );
}

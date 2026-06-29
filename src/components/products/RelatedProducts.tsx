import React from 'react';
import ProductCard from '../ProductCard';
import { ProductDTO } from '../../types/product';
import './RelatedProducts.css';

interface RelatedProductsProps {
  products: ProductDTO[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="related-products">
      <div className="section-header">
        <span className="section-label">You May Also Like</span>
        <h2 className="heading-1">Related Products</h2>
        <div className="section-divider" />
      </div>

      <div className="related-products__grid">
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
    </div>
  );
}

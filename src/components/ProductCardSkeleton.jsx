import './ProductCardSkeleton.css';

/**
 * Shimmer skeleton loader that matches ProductCard dimensions.
 * Use while products are loading from the API.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__image skeleton-shimmer" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__meta">
          <div className="skeleton-line skeleton-shimmer" style={{ width: '45%', height: '10px' }} />
          <div className="skeleton-pill skeleton-shimmer" />
        </div>
        <div className="skeleton-line skeleton-shimmer" style={{ width: '80%', height: '16px', marginTop: '0.5rem' }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: '12px', marginTop: '0.375rem' }} />
        <div className="skeleton-card__footer">
          <div className="skeleton-line skeleton-shimmer" style={{ width: '35%', height: '18px' }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '30%', height: '12px' }} />
        </div>
      </div>
    </div>
  );
}

/** Renders a grid of N skeletons */
export function ProductGridSkeleton({ count = 4 }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

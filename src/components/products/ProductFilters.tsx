import React from 'react';
import { CategoryDTO } from '../../types/product';
import './ProductFilters.css';

interface ProductFiltersProps {
  activeCategory: string;
  activeMinPrice: string;
  activeMaxPrice: string;
  activeInStock: boolean;
  activeFeatured: boolean;
  categories: CategoryDTO[];
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  activeCategory,
  activeMinPrice,
  activeMaxPrice,
  activeInStock,
  activeFeatured,
  categories,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'minPrice' | 'maxPrice') => {
    const val = e.target.value;
    onFilterChange(type, val);
  };

  return (
    <div className="product-filters">
      <div className="product-filters__header">
        <h3 className="product-filters__title">Filters</h3>
        <button className="product-filters__clear-btn" onClick={onClearFilters}>
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div className="product-filters__section">
        <h4 className="product-filters__section-title">Categories</h4>
        <div className="product-filters__categories-list">
          <button
            className={`product-filters__cat-item ${!activeCategory ? 'product-filters__cat-item--active' : ''}`}
            onClick={() => onFilterChange('category', '')}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`product-filters__cat-item ${activeCategory === cat.slug ? 'product-filters__cat-item--active' : ''}`}
              onClick={() => onFilterChange('category', cat.slug)}
            >
              <span className="product-filters__cat-name">{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="product-filters__cat-count">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="product-filters__section">
        <h4 className="product-filters__section-title">Price Range (INR)</h4>
        <div className="product-filters__price-inputs">
          <div className="product-filters__price-field">
            <span className="product-filters__currency">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={activeMinPrice}
              onChange={(e) => handlePriceChange(e, 'minPrice')}
              min="0"
              className="product-filters__price-input"
            />
          </div>
          <span className="product-filters__price-sep">to</span>
          <div className="product-filters__price-field">
            <span className="product-filters__currency">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={activeMaxPrice}
              onChange={(e) => handlePriceChange(e, 'maxPrice')}
              min="0"
              className="product-filters__price-input"
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="product-filters__section">
        <h4 className="product-filters__section-title">Availability</h4>
        <label className="product-filters__toggle-label">
          <span className="product-filters__toggle-text">In stock only</span>
          <div className="product-filters__toggle-wrapper">
            <input
              type="checkbox"
              checked={activeInStock}
              onChange={(e) => onFilterChange('inStock', e.target.checked)}
              className="product-filters__toggle-input"
            />
            <div className="product-filters__toggle-slider" />
          </div>
        </label>
      </div>

      <div className="product-filters__section">
        <h4 className="product-filters__section-title">Collections</h4>
        <label className="product-filters__toggle-label">
          <span className="product-filters__toggle-text">Featured products</span>
          <div className="product-filters__toggle-wrapper">
            <input
              type="checkbox"
              checked={activeFeatured}
              onChange={(e) => onFilterChange('featured', e.target.checked)}
              className="product-filters__toggle-input"
            />
            <div className="product-filters__toggle-slider" />
          </div>
        </label>
      </div>
    </div>
  );
}

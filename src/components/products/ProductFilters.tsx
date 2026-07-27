import React from 'react';
import { CategoryDTO } from '../../types/product';
import { useCurrency } from '../../context/CurrencyContext';
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
  const { currency } = useCurrency();
  const [minVal, setMinVal] = React.useState(activeMinPrice ? (parseFloat(activeMinPrice) * currency.rate).toFixed(2).replace(/\.00$/, '') : '');
  const [maxVal, setMaxVal] = React.useState(activeMaxPrice ? (parseFloat(activeMaxPrice) * currency.rate).toFixed(2).replace(/\.00$/, '') : '');

  const isEditingMin = React.useRef(false);
  const isEditingMax = React.useRef(false);

  React.useEffect(() => {
    if (isEditingMin.current) {
      isEditingMin.current = false;
      return;
    }
    setMinVal(activeMinPrice ? (parseFloat(activeMinPrice) * currency.rate).toFixed(2).replace(/\.00$/, '') : '');
  }, [activeMinPrice, currency.rate]);

  React.useEffect(() => {
    if (isEditingMax.current) {
      isEditingMax.current = false;
      return;
    }
    setMaxVal(activeMaxPrice ? (parseFloat(activeMaxPrice) * currency.rate).toFixed(2).replace(/\.00$/, '') : '');
  }, [activeMaxPrice, currency.rate]);

  const handleLocalPriceChange = (val: string, type: 'minPrice' | 'maxPrice') => {
    if (type === 'minPrice') {
      isEditingMin.current = true;
      setMinVal(val);
    } else {
      isEditingMax.current = true;
      setMaxVal(val);
    }

    if (!val) {
      onFilterChange(type, '');
    } else {
      const numericVal = parseFloat(val);
      if (!isNaN(numericVal)) {
        const valInINR = (numericVal / currency.rate).toFixed(0);
        onFilterChange(type, valInINR);
      }
    }
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
        <h4 className="product-filters__section-title">Price Range ({currency.code})</h4>
        <div className="product-filters__price-inputs">
          <div className="product-filters__price-field">
            <span className="product-filters__currency">{currency.symbol.trim()}</span>
            <input
              type="number"
              placeholder="Min"
              value={minVal}
              onChange={(e) => handleLocalPriceChange(e.target.value, 'minPrice')}
              min="0"
              className="product-filters__price-input"
            />
          </div>
          <span className="product-filters__price-sep">to</span>
          <div className="product-filters__price-field">
            <span className="product-filters__currency">{currency.symbol.trim()}</span>
            <input
              type="number"
              placeholder="Max"
              value={maxVal}
              onChange={(e) => handleLocalPriceChange(e.target.value, 'maxPrice')}
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

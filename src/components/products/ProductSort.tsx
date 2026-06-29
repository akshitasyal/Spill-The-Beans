import React from 'react';
import './ProductSort.css';

interface ProductSortProps {
  currentSort: string;
  onSortChange: (value: string) => void;
}

export default function ProductSort({ currentSort, onSortChange }: ProductSortProps) {
  return (
    <div className="product-sort">
      <label htmlFor="catalog-sort" className="product-sort__label">
        Sort by:
      </label>
      <select
        id="catalog-sort"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="product-sort__select"
      >
        <option value="newest">Newest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="popular">Popular</option>
      </select>
    </div>
  );
}

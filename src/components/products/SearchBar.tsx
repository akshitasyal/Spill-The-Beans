import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { searchProducts } from '../../services/products';
import { ProductSearchResult } from '../../types/product';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  initialQuery?: string;
}

export default function SearchBar({ placeholder = 'Search coffees, blends...', initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce API search requests
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await searchProducts(query);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Error searching products:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        setShowDropdown(false);
        navigate(`/product/${results[activeIndex].slug}`);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="search-bar-wrap" ref={containerRef}>
      <form onSubmit={handleSearchSubmit} className="search-bar">
        <Search size={18} className="search-bar__icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          className="search-bar__input"
        />
        {isLoading && <Loader2 size={16} className="search-bar__spinner" />}
        {query && !isLoading && (
          <button type="button" onClick={handleClear} className="search-bar__clear">
            <X size={16} />
          </button>
        )}
      </form>

      {/* Auto-suggest Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="search-suggest-dropdown" role="listbox">
          {results.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setShowDropdown(false);
                navigate(`/product/${item.slug}`);
              }}
              className={`search-suggest-item ${activeIndex === idx ? 'search-suggest-item--active' : ''}`}
              role="option"
              aria-selected={activeIndex === idx}
            >
              <span className="search-suggest-item__name">{item.name}</span>
            </div>
          ))}
          <div
            className="search-suggest-view-all"
            onClick={() => {
              setShowDropdown(false);
              navigate(`/search?q=${encodeURIComponent(query)}`);
            }}
          >
            Press Enter to see all results for "{query}"
          </div>
        </div>
      )}

      {showDropdown && query && results.length === 0 && !isLoading && (
        <div className="search-suggest-dropdown search-suggest-dropdown--empty">
          No matches found for "{query}"
        </div>
      )}
    </div>
  );
}

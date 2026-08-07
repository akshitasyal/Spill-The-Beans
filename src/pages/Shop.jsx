import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, Coffee, ShoppingBag, LayoutGrid, Droplets } from 'lucide-react';
import { getVisibleProducts, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import PageWrapper from '../components/PageWrapper';
import { useCurrency } from '../context/CurrencyContext';
import './Shop.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];


const CATEGORY_TABS = [
  { value: '', label: 'All Products', icon: LayoutGrid },
  { value: 'coffee', label: 'Coffees', icon: Coffee },
  { value: CATEGORIES.ICED_TEA, label: 'Iced Tea', icon: Droplets },
  { value: CATEGORIES.ACCESSORIES, label: 'Accessories', icon: ShoppingBag },
];

const COFFEE_CATEGORIES = [CATEGORIES.INSTANT, CATEGORIES.BUNDLE];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const wildcard = params['*'] || '';
  const pathParts = wildcard.split('/').filter(Boolean);

  const pathCat = pathParts[0] ? pathParts[0].toLowerCase() : '';
  const pathSub = pathParts[1] ? pathParts[1].toLowerCase() : '';

  const [priceOpen, setPriceOpen] = useState(false);
  const [flavoursOpen, setFlavoursOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const { formatPrice } = useCurrency();
  const priceRef = useRef(null);
  const flavoursRef = useRef(null);
  const sortRef = useRef(null);

  const dynamicPriceOptions = useMemo(() => [
    { value: '', label: 'All Prices' },
    { value: 'under-400', label: `Under ${formatPrice(400)}` },
    { value: '400-800', label: `${formatPrice(400)} – ${formatPrice(800)}` },
    { value: 'over-800', label: `Over ${formatPrice(800)}` },
  ], [formatPrice]);

  const activePriceRange = searchParams.get('price') || '';
  const activeSort = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('q') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  let activeCategory = searchParams.get('category') || '';
  if (!activeCategory && pathCat) {
    if (pathCat === 'coffee' || pathCat === 'instant' || pathCat === 'premium') {
      activeCategory = 'coffee';
    } else if (pathCat === 'tea' || pathCat === 'iced-tea' || pathCat === 'guilt-free') {
      activeCategory = CATEGORIES.ICED_TEA;
    } else if (pathCat === 'accessories') {
      activeCategory = CATEGORIES.ACCESSORIES;
    }
  }

  let activeFlavour = searchParams.get('flavour') || '';
  if (!activeFlavour && pathSub) {
    if (pathSub === 'lemon') activeFlavour = 'Lemon';
    else if (pathSub === 'strawberry') activeFlavour = 'Strawberry';
    else if (pathSub === 'guava' || pathSub === 'guava-chilli') activeFlavour = 'Guava Chilli';
  }

  const activeFilter = searchParams.get('filter') || (pathParts.includes('bestseller') ? 'bestseller' : pathSub === 'sachets' ? 'sachets' : pathSub === 'assorted' ? 'assorted' : '');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (priceRef.current && !priceRef.current.contains(e.target)) setPriceOpen(false);
      if (flavoursRef.current && !flavoursRef.current.contains(e.target)) setFlavoursOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const setCategory = (val) => {
    const next = new URLSearchParams(searchParams);
    // Reset flavour when switching category
    next.delete('flavour');
    if (val) next.set('category', val);
    else next.delete('category');
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  // Read deleted-slugs-filtered product list on every render so admin deletes
  // are reflected here without a full page reload.
  const visibleProducts = useMemo(() => getVisibleProducts(), []);

  // Dynamic counts for flavours based on the actual catalog
  const flavourCounts = useMemo(() => {
    const counts = {};
    visibleProducts.forEach(p => {
      if (p.flavour) {
        counts[p.flavour] = (counts[p.flavour] || 0) + 1;
      }
    });
    return counts;
  }, [visibleProducts]);

  const filtered = useMemo(() => {
    let result = [...visibleProducts];

    // Category tab filter
    if (activeCategory === 'coffee') {
      result = result.filter(p => COFFEE_CATEGORIES.includes(p.category));
    } else if (activeCategory === CATEGORIES.ACCESSORIES) {
      result = result.filter(p => p.category === CATEGORIES.ACCESSORIES);
    } else if (activeCategory === CATEGORIES.ICED_TEA) {
      result = result.filter(p => p.category === CATEGORIES.ICED_TEA);
    }

    if (activeFilter === 'bestseller') {
      result = result.filter(p => p.isBestseller);
    } else if (activeFilter === 'sachets') {
      result = result.filter(p => p.tags?.includes('sachets') || p.weight?.toLowerCase().includes('sachet'));
    } else if (activeFilter === 'assorted') {
      result = result.filter(p => p.flavour === 'Assorted' || p.tags?.includes('assorted') || p.name.toLowerCase().includes('assorted'));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.origin?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeFlavour) {
      const selectedFlavours = activeFlavour.split('&').map(s => s.trim().toLowerCase());
      result = result.filter(p => {
        if (!p.flavour) return false;
        const pf = p.flavour.toLowerCase();
        return pf === activeFlavour.toLowerCase() ||
               selectedFlavours.some(f => pf.includes(f)) ||
               p.flavourNotes?.some(note => selectedFlavours.some(f => note.toLowerCase().includes(f)));
      });
    }
    if (inStockOnly) result = result.filter(p => p.inStock);

    if (activePriceRange === 'under-400') {
      result = result.filter(p => p.price < 400);
    } else if (activePriceRange === '400-800') {
      result = result.filter(p => p.price >= 400 && p.price <= 800);
    } else if (activePriceRange === 'over-800') {
      result = result.filter(p => p.price > 800);
    }

    switch (activeSort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: break; // Keep the sequence defined in products.js
    }

    return result;
  }, [visibleProducts, activeFlavour, activeFilter, activeSort, searchQuery, activePriceRange, inStockOnly, activeCategory]);

  // Compute recommended products when filtered results are sparse (< 4)
  const recommendedProducts = useMemo(() => {
    if (filtered.length >= 4) return [];
    const filteredIds = new Set(filtered.map(p => p.id));
    return visibleProducts
      .filter(p => !filteredIds.has(p.id))
      .slice(0, 4);
  }, [filtered, visibleProducts]);

  const hasActiveFilters = !!(activeCategory || activeFlavour || activeFilter || activePriceRange || searchQuery || inStockOnly);

  const isAccessoriesView = activeCategory === CATEGORIES.ACCESSORIES;

  const pageTitle = searchQuery
    ? `"${searchQuery}" — Shop | Spill The Beans`
    : isAccessoriesView
    ? 'Accessories | Spill The Beans'
    : activeCategory === 'coffee'
    ? 'Shop All Coffees | Spill The Beans'
    : 'Shop | Spill The Beans';

  return (
    <PageWrapper className="shop-page">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Browse Spill The Beans' full collection — premium Indian coffees, instant blends, bundles, gift packs, and coffee accessories." />
      </Helmet>


      {/* Filter Bar */}
      <div className="shop-filter-bar">
        <div className="container shop-filter-bar__container">

          {/* Left: In stock only toggle */}
          <div className="shop-filter-bar__left">
            <span className="shop-filter-label">In stock only</span>
            <button
              className={`shop-toggle ${inStockOnly ? 'shop-toggle--active' : ''}`}
              onClick={() => setParam('inStock', inStockOnly ? '' : 'true')}
              aria-label="Toggle in stock only"
            >
              <span className="shop-toggle__thumb" />
            </button>
          </div>

          {/* Center: Dropdowns */}
          <div className="shop-filter-bar__center">
            {/* Price Dropdown */}
            <div className="shop-dropdown" ref={priceRef}>
              <button
                className={`shop-dropdown__btn ${activePriceRange ? 'shop-dropdown__btn--active' : ''}`}
                onClick={() => setPriceOpen(!priceOpen)}
              >
                Price
                <ChevronDown size={14} className={`shop-dropdown__chevron ${priceOpen ? 'rotated' : ''}`} />
              </button>
              {priceOpen && (
                <div className="shop-dropdown__menu">
                  {dynamicPriceOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`shop-dropdown__item ${activePriceRange === opt.value ? 'active' : ''}`}
                      onClick={() => {
                        setParam('price', opt.value);
                        setPriceOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Flavours Dropdown — only show for coffee view */}
            {activeCategory !== CATEGORIES.ACCESSORIES && (
              <div className="shop-dropdown" ref={flavoursRef}>
                <button
                  className={`shop-dropdown__btn ${activeFlavour ? 'shop-dropdown__btn--active' : ''}`}
                  onClick={() => setFlavoursOpen(!flavoursOpen)}
                >
                  Flavours
                  <ChevronDown size={14} className={`shop-dropdown__chevron ${flavoursOpen ? 'rotated' : ''}`} />
                </button>
                {flavoursOpen && (
                  <div className="shop-dropdown__menu shop-dropdown__menu--wide">
                    <button
                      className={`shop-dropdown__grid-item ${!activeFlavour ? 'active' : ''}`}
                      onClick={() => {
                        setParam('flavour', '');
                        setFlavoursOpen(false);
                      }}
                    >
                      All Flavours
                    </button>
                    {Object.entries(flavourCounts).map(([name, count]) => (
                      <button
                        key={name}
                        className={`shop-dropdown__grid-item ${activeFlavour === name ? 'active' : ''}`}
                        onClick={() => {
                          setParam('flavour', name);
                          setFlavoursOpen(false);
                        }}
                      >
                        {name} ({count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Sort + result count */}
          <div className="shop-filter-bar__right">
            <span className="shop-filter-label shop-result-count">{filtered.length} items</span>
            <div className="shop-dropdown" ref={sortRef}>
              <button
                className="shop-dropdown__btn"
                onClick={() => setSortOpen(!sortOpen)}
              >
                Sort by: {SORT_OPTIONS.find(o => o.value === activeSort)?.label || 'Featured'}
                <ChevronDown size={14} className={`shop-dropdown__chevron ${sortOpen ? 'rotated' : ''}`} />
              </button>
              {sortOpen && (
                <div className="shop-dropdown__menu shop-dropdown__menu--right">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`shop-dropdown__item ${activeSort === opt.value ? 'active' : ''}`}
                      onClick={() => {
                        setParam('sort', opt.value);
                        setSortOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="container" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
          <div className="shop-active-filters">
            <span className="shop-active-filters__title">Filtered by:</span>
            {activeCategory && (
              <span className="shop-active-chip">
                Category: {activeCategory}
                <button onClick={() => setParam('category', '')} aria-label="Clear category filter">✕</button>
              </span>
            )}
            {activeFlavour && (
              <span className="shop-active-chip">
                Flavour: {activeFlavour}
                <button onClick={() => setParam('flavour', '')} aria-label="Clear flavour filter">✕</button>
              </span>
            )}
            {activeFilter && (
              <span className="shop-active-chip">
                Filter: {activeFilter}
                <button onClick={() => setParam('filter', '')} aria-label="Clear filter">✕</button>
              </span>
            )}
            {activePriceRange && (
              <span className="shop-active-chip">
                Price: {activePriceRange}
                <button onClick={() => setParam('price', '')} aria-label="Clear price filter">✕</button>
              </span>
            )}
            {inStockOnly && (
              <span className="shop-active-chip">
                In Stock Only
                <button onClick={() => setParam('inStock', '')} aria-label="Clear in stock filter">✕</button>
              </span>
            )}
            {searchQuery && (
              <span className="shop-active-chip">
                Search: "{searchQuery}"
                <button onClick={() => setParam('q', '')} aria-label="Clear search filter">✕</button>
              </span>
            )}
            <button className="shop-clear-all-btn" onClick={clearFilters}>Clear All</button>
          </div>
        </div>
      )}

      <div className="container">

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="shop-empty">
            <span style={{ fontSize: '3rem' }}>☕</span>
            <p className="heading-3" style={{ color: 'var(--text-muted)' }}>Nothing found</p>
            <p className="text-body">Try adjusting your filters or search query.</p>
            <button className="btn btn-outline" onClick={clearFilters} id="shop-reset-btn">
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {filtered.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Recommended Products Section if fewer than 4 items match */}
            {recommendedProducts.length > 0 && (
              <div className="shop-recommended-section">
                <div className="shop-recommended-header">
                  <h3 className="heading-2">You Might Also Like</h3>
                  <p className="text-subtle">Explore popular bestsellers and other fan-favourite coffee blends</p>
                </div>
                <div className="products-grid">
                  {recommendedProducts.map((product) => (
                    <div key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}

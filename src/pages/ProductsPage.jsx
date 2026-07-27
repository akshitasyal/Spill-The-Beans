import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X } from 'lucide-react';
import { getProducts, getCategories } from '../services/products';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Pagination from '../components/ui/Pagination';
import ProductFilters from '../components/products/ProductFilters';
import ProductSort from '../components/products/ProductSort';
import ProductGrid from '../components/products/ProductGrid';
import PageWrapper from '../components/PageWrapper';
import './ProductsPage.css';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Mobile drawer filter toggle state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [error, setError] = useState(null);

  // Read filter values from URL search params
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const inStock = searchParams.get('inStock') === 'true';
  const featured = searchParams.get('featured') === 'true';

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products whenever filters or pagination parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const filters = {
          category: category || undefined,
          search: search || undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          sort,
          page,
          limit: 9, // 9 products per page for a nice 3x3 layout
          featured: featured || undefined,
          inStock: inStock || undefined,
        };

        const res = await getProducts(filters);
        if (res.success) {
          setProducts(res.items);
          setTotalPages(res.totalPages);
          setTotalProducts(res.total);
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to connect to the product database server');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, search, minPrice, maxPrice, sort, page, inStock, featured]);

  // Function to update a single URL query param
  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    
    // Always reset to page 1 on filter changes
    params.set('page', '1');

    if (value === '' || value === null || value === undefined || value === false) {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Breadcrumbs path
  const breadcrumbItems = [{ label: 'Shop', to: '/products' }];
  if (category) {
    const catObj = categories.find((c) => c.slug === category);
    breadcrumbItems.push({ label: catObj ? catObj.name : category });
  }

  const emptyState = (
    <div className="products-page__empty">
      <h3 className="heading-3">No Products Found</h3>
      <p className="text-body">We couldn't find any coffees matching your active filter choices.</p>
      <button onClick={handleClearFilters} className="btn btn-primary btn-md">
        Reset All Filters
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Shop Coffee | Spill The Beans</title>
        <meta name="description" content="Shop Spill The Beans selection of premium gourmet coffee. Filter by price, category, availability and sort to find your perfect daily blend." />
      </Helmet>

      <Breadcrumbs items={breadcrumbItems} />

      <PageWrapper className="products-page">
        <div className="container">
          {/* Header section with page title & description */}
          <div className="products-page__header">
            <div>
              <span className="section-label">Gourmet Catalog</span>
              <h1 className="heading-2">Shop Our Coffees</h1>
            </div>
            
            {/* Sorting and Mobile Filter Trigger */}
            <div className="products-page__controls">
              <button
                className="btn btn-outline products-page__mobile-filter-btn"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
              <ProductSort currentSort={sort} onSortChange={(val) => handleFilterChange('sort', val)} />
            </div>
          </div>

          <div className="products-page__content-layout">
            {/* Sidebar Filters (Desktop) */}
            <aside className="products-page__sidebar">
              <ProductFilters
                activeCategory={category}
                activeMinPrice={minPrice}
                activeMaxPrice={maxPrice}
                activeInStock={inStock}
                activeFeatured={featured}
                categories={categories}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </aside>

            {/* Mobile Filters Drawer Overlay */}
            {mobileFiltersOpen && (
              <div className="products-page__mobile-overlay">
                <div className="products-page__mobile-drawer-bg" onClick={() => setMobileFiltersOpen(false)} />
                <div className="products-page__mobile-drawer">
                  <div className="products-page__mobile-drawer-header">
                    <h3 className="heading-3" style={{ margin: 0 }}>Filter & Sort</h3>
                    <button className="products-page__mobile-close" onClick={() => setMobileFiltersOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="products-page__mobile-drawer-body">
                    <ProductFilters
                      activeCategory={category}
                      activeMinPrice={minPrice}
                      activeMaxPrice={maxPrice}
                      activeInStock={inStock}
                      activeFeatured={featured}
                      categories={categories}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                  <div className="products-page__mobile-drawer-footer">
                    <button className="btn btn-primary w-full" onClick={() => setMobileFiltersOpen(false)}>
                      Apply Filters ({totalProducts} Results)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Product Listing Section */}
            <main className="products-page__main">
              {error ? (
                <div className="products-page__error">
                  <p className="text-lg text-muted">{error}</p>
                  <button onClick={() => window.location.reload()} className="btn btn-outline">
                    Refresh Page
                  </button>
                </div>
              ) : (
                <>
                  <ProductGrid products={products} isLoading={isLoading} emptyState={emptyState} />
                  {!isLoading && products.length > 0 && (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

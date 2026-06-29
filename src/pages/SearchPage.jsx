import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Inbox } from 'lucide-react';
import { getProducts } from '../services/products';
import SearchBar from '../components/products/SearchBar';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/ui/Pagination';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import PageWrapper from '../components/PageWrapper';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q.trim()) {
      setProducts([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getProducts({ search: q, page, limit: 12 });
        if (res.success) {
          setProducts(res.items);
          setTotalResults(res.total);
          setTotalPages(res.totalPages);
        } else {
          setError('Failed to load search results');
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to connect to search API');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [q, page]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const emptyState = (
    <div className="search-page__empty">
      <Inbox size={48} className="text-muted" />
      <h3 className="heading-3">No Results Found</h3>
      <p className="text-body">
        We couldn't find any coffee or blends matching "{q}". Try checking your spelling or search for something else.
      </p>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{q ? `"${q}" — Search Results` : 'Search Coffees'} | Spill The Beans</title>
      </Helmet>

      <Breadcrumbs items={[{ label: 'Search' }]} />

      <PageWrapper className="search-page">
        <div className="container">
          <div className="search-page__header">
            <span className="section-label">Find Your Cup</span>
            <h1 className="heading-2">Search Coffee</h1>
            <p className="text-body search-page__desc">
              Discover raw single origin estate beans, dark roasts, and flavoured coffee powders.
            </p>
            <div className="search-page__input-wrap">
              <SearchBar initialQuery={q} placeholder="Search hazelnut, vanilla, espresso..." />
            </div>
          </div>

          <div className="search-page__results-section">
            {q ? (
              <>
                <div className="search-page__results-meta">
                  {isLoading ? (
                    <span>Searching for "{q}"...</span>
                  ) : (
                    <span>
                      Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{q}"
                    </span>
                  )}
                </div>

                {error ? (
                  <div className="search-page__error">
                    <p className="text-lg text-muted">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-outline">
                      Try Again
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
              </>
            ) : (
              <div className="search-page__initial-state">
                <p className="text-muted">Type above to search for your favorite blends.</p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

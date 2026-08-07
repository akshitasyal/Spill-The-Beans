import { ProductFilters, ProductDTO, CategoryDTO, ProductSearchResult, ProductVariantDTO } from '../types/product';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`;

export const getProducts = async (filters: ProductFilters = {}): Promise<{
  success: boolean;
  items: ProductDTO[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  
  if (filters.category) params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);
  if (filters.minPrice !== undefined) params.set('minPrice', (filters.minPrice * 100).toString()); // convert from INR to paise
  if (filters.maxPrice !== undefined) params.set('maxPrice', (filters.maxPrice * 100).toString()); // convert from INR to paise
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.featured !== undefined) params.set('featured', filters.featured.toString());
  if (filters.inStock !== undefined) params.set('inStock', filters.inStock.toString());

  const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
};

export const getProductBySlug = async (slug: string): Promise<{
  success: boolean;
  data: {
    product: ProductDTO;
    variants: ProductVariantDTO[];
    category: CategoryDTO;
    reviewSummary: {
      averageRating: number;
      reviewCount: number;
      recentReviews: any[];
    };
    relatedProducts: ProductDTO[];
  };
}> => {
  const res = await fetch(`${API_BASE_URL}/products/${slug}`);
  if (!res.ok) {
    throw new Error('Failed to fetch product details');
  }
  return res.json();
};

export const searchProducts = async (query: string): Promise<{
  success: boolean;
  data: ProductSearchResult[];
}> => {
  if (!query.trim()) return { success: true, data: [] };
  const res = await fetch(`${API_BASE_URL}/products/search?search=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error('Failed to search products');
  }
  return res.json();
};

export const getRelatedProducts = async (slug: string): Promise<{
  success: boolean;
  data: ProductDTO[];
}> => {
  const res = await fetch(`${API_BASE_URL}/products/${slug}/related`);
  if (!res.ok) {
    throw new Error('Failed to fetch related products');
  }
  return res.json();
};

export const getCategories = async (): Promise<{
  success: boolean;
  data: CategoryDTO[];
}> => {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  return res.json();
};

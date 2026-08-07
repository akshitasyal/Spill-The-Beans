export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  productCount?: number;
}

export interface ReviewDTO {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  user?: {
    name: string | null;
  };
}

export interface ProductVariantDTO {
  id: string;
  name: string;
  slug: string;
  flavour: string | null;
  size: string | null;
  price: number;      // in paise
  salePrice: number | null;
  stock: number;
  images: string[];
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // in paise
  salePrice: number | null; // in paise
  images: string[];
  stock: number;
  weight: string | null;
  baseProduct: string | null;
  flavour: string | null;
  size: string | null;
  roast: string | null;
  origin: string | null;
  process: string | null;
  flavourNotes: string[];
  highlights: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  isLimited: boolean;
  limitedQty: number | null;
  categoryId: string;
  category?: CategoryDTO;
  reviews?: ReviewDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
  featured?: boolean;
  inStock?: boolean;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
}

import { fetchWithAuth } from './apiClient';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

export const ProductService = {
  async queryProducts({ search, categoryId, isActive, isFeatured, sortBy, order, page = 1, limit = 10 }) {
    const queryParams = new URLSearchParams({
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && isActive !== '' && { isActive }),
      ...(isFeatured !== undefined && isFeatured !== '' && { isFeatured }),
      ...(sortBy && { sortBy }),
      ...(order && { order }),
      page: String(page),
      limit: String(limit),
    });

    const res = await fetchWithAuth(`${API_BASE_URL}/products?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load products');
    return await res.json();
  },

  async getProduct(id) {
    const res = await fetchWithAuth(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    const payload = await res.json();
    return payload.data;
  },

  async createProduct(productData) {
    const res = await fetchWithAuth(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Could not create product');
    return await res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Could not update product');
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Could not delete product');
    return await res.json();
  },

  async bulkDelete(ids) {
    for (const id of ids) {
      await this.deleteProduct(id);
    }
    return { success: true };
  },

  async bulkUpdateStatus(ids, isActive) {
    for (const id of ids) {
      await this.updateProduct(id, { isActive });
    }
    return { success: true };
  },

  async bulkUpdateFeatured(ids, isFeatured) {
    for (const id of ids) {
      await this.updateProduct(id, { isFeatured });
    }
    return { success: true };
  }
};

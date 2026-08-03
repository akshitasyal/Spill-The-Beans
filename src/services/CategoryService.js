import { fetchWithAuth } from './apiClient';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

export const CategoryService = {
  async getCategories() {
    const res = await fetchWithAuth(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    return await res.json();
  },

  async createCategory(categoryData) {
    const res = await fetchWithAuth(`${API_BASE_URL}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) throw new Error('Could not create category');
    return await res.json();
  },

  async updateCategory(id, categoryData) {
    const res = await fetchWithAuth(`${API_BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) throw new Error('Could not update category');
    return await res.json();
  },

  async deleteCategory(id) {
    const res = await fetchWithAuth(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Could not delete category');
    return await res.json();
  }
};


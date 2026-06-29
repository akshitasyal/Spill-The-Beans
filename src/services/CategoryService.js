import { ADMIN_CATEGORIES } from '../data/adminSeedData';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

function getLocalCategories() {
  const local = localStorage.getItem('stb_admin_categories');
  if (!local) {
    localStorage.setItem('stb_admin_categories', JSON.stringify(ADMIN_CATEGORIES));
    return ADMIN_CATEGORIES;
  }
  return JSON.parse(local);
}

function saveLocalCategories(categories) {
  localStorage.setItem('stb_admin_categories', JSON.stringify(categories));
}

export const CategoryService = {
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('API server error');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CategoryService.getCategories falling back to localStorage:', err.message);
      const categories = getLocalCategories();
      
      // Calculate Product Counts from local storage products
      let products = [];
      try {
        products = JSON.parse(localStorage.getItem('stb_admin_products') || '[]');
      } catch (e) {
        console.error(e);
      }

      const mapped = categories.map(cat => {
        const productCount = products.filter(p => p.categoryId === cat.id).length;
        return {
          ...cat,
          productCount,
          // support schema relations for display
          parent: cat.parentId ? categories.find(c => c.id === cat.parentId) : null,
          children: categories.filter(c => c.parentId === cat.id)
        };
      });

      return { success: true, data: mapped };
    }
  },

  async createCategory(categoryData) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      if (!res.ok) throw new Error('Could not create category');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CategoryService.createCategory falling back to localStorage:', err.message);
      const categories = getLocalCategories();
      
      const newCat = {
        ...categoryData,
        id: `cat-${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      // Check unique slug/name
      const exists = categories.some(c => c.slug.toLowerCase() === newCat.slug.toLowerCase());
      if (exists) throw new Error('Category Slug must be unique', { cause: err });

      categories.push(newCat);
      saveLocalCategories(categories);
      return { success: true, data: newCat };
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      if (!res.ok) throw new Error('Could not update category');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CategoryService.updateCategory falling back to localStorage:', err.message);
      const categories = getLocalCategories();
      const idx = categories.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Category not found', { cause: err });

      // Check slug collision
      if (categoryData.slug && categoryData.slug !== categories[idx].slug) {
        const exists = categories.some(c => c.slug.toLowerCase() === categoryData.slug.toLowerCase());
        if (exists) throw new Error('Category Slug must be unique', { cause: err });
      }

      const updated = {
        ...categories[idx],
        ...categoryData,
        updatedAt: new Date().toISOString(),
      };

      categories[idx] = updated;
      saveLocalCategories(categories);
      return { success: true, data: updated };
    }
  },

  async deleteCategory(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Could not delete category');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CategoryService.deleteCategory falling back to localStorage:', err.message);
      let categories = getLocalCategories();
      
      // Prevent deleting if it has active child categories to keep nesting clean
      const hasChildren = categories.some(c => c.parentId === id);
      if (hasChildren) {
        throw new Error('Cannot delete category containing subcategories. Relocate child categories first.', { cause: err });
      }

      categories = categories.filter(c => c.id !== id);
      saveLocalCategories(categories);
      return { success: true };
    }
  }
};

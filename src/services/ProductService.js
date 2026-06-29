import { ADMIN_SEED_PRODUCTS } from '../data/adminSeedData';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

// Ensure local storage is initialized in fallback mode
function getLocalProducts() {
  const local = localStorage.getItem('stb_admin_products');
  if (!local || JSON.parse(local).length !== ADMIN_SEED_PRODUCTS.length) {
    localStorage.setItem('stb_admin_products', JSON.stringify(ADMIN_SEED_PRODUCTS));
    return ADMIN_SEED_PRODUCTS;
  }
  return JSON.parse(local);
}

function saveLocalProducts(products) {
  localStorage.setItem('stb_admin_products', JSON.stringify(products));
}

export const ProductService = {
  async queryProducts({ search, categoryId, isActive, isFeatured, sortBy, order, page = 1, limit = 10 }) {
    try {
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

      const res = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
      if (!res.ok) throw new Error('API server error');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ ProductService.queryProducts falling back to localStorage:', err.message);
      
      let items = getLocalProducts();

      // Filter by Active
      if (isActive !== undefined && isActive !== '') {
        const activeBool = isActive === 'true';
        items = items.filter(i => i.isActive === activeBool);
      }
      // Filter by Featured
      if (isFeatured !== undefined && isFeatured !== '') {
        const featuredBool = isFeatured === 'true';
        items = items.filter(i => i.isFeatured === featuredBool);
      }
      // Filter by Category
      if (categoryId) {
        items = items.filter(i => i.categoryId === categoryId);
      }
      // Search
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(i => 
          i.name.toLowerCase().includes(q) || 
          (i.sku && i.sku.toLowerCase().includes(q)) || 
          (i.shortDescription && i.shortDescription.toLowerCase().includes(q))
        );
      }

      // Sort
      if (sortBy) {
        items.sort((a, b) => {
          let valA = a[sortBy];
          let valB = b[sortBy];
          if (typeof valA === 'string') {
            return order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
          }
          return order === 'desc' ? (valB - valA) : (valA - valB);
        });
      } else {
        // default by ID/creation descending
        items.reverse();
      }

      const total = items.length;
      const skip = (page - 1) * limit;
      const paginatedItems = items.slice(skip, skip + limit);

      return {
        success: true,
        data: paginatedItems,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        }
      };
    }
  },

  async getProduct(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const payload = await res.json();
      return payload.data;
    } catch (err) {
      console.warn('⚠️ ProductService.getProduct falling back to localStorage:', err.message);
      const items = getLocalProducts();
      const product = items.find(i => i.id === id);
      if (!product) throw new Error('Product not found', { cause: err });
      return product;
    }
  },

  async createProduct(productData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error('Could not create product');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ ProductService.createProduct falling back to localStorage:', err.message);
      const items = getLocalProducts();
      const newProduct = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Enforce unique SKU check if SKU is defined
      if (productData.sku) {
        const skuExists = items.some(i => i.sku?.toLowerCase() === productData.sku.toLowerCase());
        if (skuExists) throw new Error('SKU must be unique', { cause: err });
      }

      items.push(newProduct);
      saveLocalProducts(items);

      // Log to inventory history as a helper
      logInventoryChange(newProduct.id, 0, newProduct.stock || 0, 'Initial Stock Creation');

      return { success: true, data: newProduct };
    }
  },

  async updateProduct(id, productData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error('Could not update product');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ ProductService.updateProduct falling back to localStorage:', err.message);
      const items = getLocalProducts();
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Product not found', { cause: err });

      // Enforce unique SKU check
      if (productData.sku && productData.sku !== items[idx].sku) {
        const skuExists = items.some(i => i.sku?.toLowerCase() === productData.sku.toLowerCase());
        if (skuExists) throw new Error('SKU must be unique', { cause: err });
      }

      const prevStock = items[idx].stock || 0;
      const updatedProduct = {
        ...items[idx],
        ...productData,
        updatedAt: new Date().toISOString(),
      };

      items[idx] = updatedProduct;
      saveLocalProducts(items);

      // Log stock change if modified
      if (productData.stock !== undefined && Number(productData.stock) !== prevStock) {
        logInventoryChange(id, prevStock, Number(productData.stock), 'Manual Admin Adjustment');
      }

      return { success: true, data: updatedProduct };
    }
  },

  async deleteProduct(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Could not delete product');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ ProductService.deleteProduct falling back to localStorage:', err.message);
      let items = getLocalProducts();
      items = items.filter(i => i.id !== id);
      saveLocalProducts(items);
      return { success: true };
    }
  },

  async bulkDelete(ids) {
    // Sequentially delete from storage/api
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

// Internal Helper to log inventory status changes in mock local storage mode
function logInventoryChange(productId, previousStock, newStock, reason) {
  try {
    const logs = JSON.parse(localStorage.getItem('stb_admin_inventory_logs') || '[]');
    const change = newStock - previousStock;
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      change: change > 0 ? `+${change}` : String(change),
      previousStock,
      newStock,
      reason,
      admin: 'Admin User',
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem('stb_admin_inventory_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log inventory change locally:', e);
  }
}

import { ADMIN_SEED_PRODUCTS } from '../data/adminSeedData';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

// Initialize mock inventory history
const MOCK_HISTORY_SEEDS = [
  { id: 'log-1', productName: 'Raat Ki Rani Espresso', change: '-10', previousStock: 19, newStock: 9, reason: 'Order fulfillment #STB-4819', admin: 'Courier Sync Service', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 'log-2', productName: 'Mocha pe Chauka Gourmet Soluble', change: '+100', previousStock: 180, newStock: 280, reason: 'Warehouse Restock', admin: 'Admin User', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log-3', productName: 'Hazelnut Bliss Instant', change: '-2', previousStock: 352, newStock: 350, reason: 'Order fulfillment #STB-4818', admin: 'Courier Sync Service', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'log-4', productName: 'Kacha Aam Instant Tango', change: '-4', previousStock: 4, newStock: 0, reason: 'Stock damage write-off', admin: 'Admin User', timestamp: new Date(Date.now() - 86400000).toISOString() }
];

function getLocalProducts() {
  const local = localStorage.getItem('stb_admin_products');
  if (!local) {
    localStorage.setItem('stb_admin_products', JSON.stringify(ADMIN_SEED_PRODUCTS));
    return ADMIN_SEED_PRODUCTS;
  }
  return JSON.parse(local);
}

function saveLocalProducts(products) {
  localStorage.setItem('stb_admin_products', JSON.stringify(products));
}

function getLocalLogs() {
  const local = localStorage.getItem('stb_admin_inventory_logs');
  if (!local) {
    localStorage.setItem('stb_admin_inventory_logs', JSON.stringify(MOCK_HISTORY_SEEDS));
    return MOCK_HISTORY_SEEDS;
  }
  return JSON.parse(local);
}

function saveLocalLogs(logs) {
  localStorage.setItem('stb_admin_inventory_logs', JSON.stringify(logs));
}

export const InventoryService = {
  async getInventory() {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory`);
      if (!res.ok) throw new Error('API server error');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ InventoryService.getInventory falling back to localStorage:', err.message);
      const products = getLocalProducts();

      // Return mapped inventory nodes
      const inventory = products.map(p => {
        // Reserved is 5% of stock as mock or fixed 2 units for demo
        const reservedStock = p.stock > 10 ? 4 : (p.stock > 0 ? 1 : 0);
        const availableStock = Math.max(0, p.stock - reservedStock);
        
        // Threshold (defaults to 15)
        const threshold = p.lowStockThreshold || 15;
        let status = 'In Stock';
        if (p.stock === 0) status = 'Out of Stock';
        else if (p.stock <= threshold) status = 'Low Stock';

        return {
          id: p.id,
          name: p.name,
          sku: p.sku || 'N/A',
          stock: p.stock,
          reservedStock,
          availableStock,
          lowStockThreshold: threshold,
          status,
          updatedAt: p.updatedAt || p.createdAt || new Date().toISOString()
        };
      });

      return { success: true, data: inventory };
    }
  },

  async updateStock(id, stockCount, reason = 'Manual Adjustment') {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: stockCount }),
      });
      if (!res.ok) throw new Error('Could not update inventory stock');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ InventoryService.updateStock falling back to localStorage:', err.message);
      const products = getLocalProducts();
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found', { cause: err });

      const prevStock = products[idx].stock;
      products[idx].stock = parseInt(stockCount);
      products[idx].updatedAt = new Date().toISOString();
      saveLocalProducts(products);

      // Save log
      const logs = getLocalLogs();
      const change = stockCount - prevStock;
      const newLog = {
        id: `log-${Date.now()}`,
        productName: products[idx].name,
        change: change >= 0 ? `+${change}` : String(change),
        previousStock: prevStock,
        newStock: parseInt(stockCount),
        reason,
        admin: 'Admin User',
        timestamp: new Date().toISOString()
      };
      logs.unshift(newLog);
      saveLocalLogs(logs);

      return { success: true, data: products[idx] };
    }
  },

  async updateThreshold(id, threshold) {
    try {
      // Threshold config maps to product patch
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lowStockThreshold: parseInt(threshold) }),
      });
      if (!res.ok) throw new Error('Could not update threshold');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ InventoryService.updateThreshold falling back to localStorage:', err.message);
      const products = getLocalProducts();
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found', { cause: err });

      products[idx].lowStockThreshold = parseInt(threshold);
      saveLocalProducts(products);
      return { success: true, data: products[idx] };
    }
  },

  async getInventoryHistory() {
    try {
      // Endpoint can fall back
      const res = await fetch(`${API_BASE_URL}/inventory/history`);
      if (!res.ok) throw new Error('API server error');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ InventoryService.getInventoryHistory falling back to localStorage:', err.message);
      const logs = getLocalLogs();
      return { success: true, data: logs };
    }
  }
};

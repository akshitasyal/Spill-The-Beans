const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

export const InventoryService = {
  async getInventory() {
    const res = await fetch(`${API_BASE_URL}/inventory`);
    if (!res.ok) throw new Error('Failed to load inventory');
    return await res.json();
  },

  async updateStock(id, stockCount, reason = 'Manual Adjustment') {
    // First get current stock so we can log the change
    const inventoryRes = await this.getInventory();
    const currentItem = inventoryRes.success
      ? inventoryRes.data.find(p => p.id === id)
      : null;
    const previousStock = currentItem?.stock ?? 0;

    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: stockCount }),
    });
    if (!res.ok) throw new Error('Could not update inventory stock');
    const result = await res.json();

    // Log the change to the inventory history
    try {
      await fetch(`${API_BASE_URL}/inventory/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          productName: currentItem?.name || 'Unknown Product',
          change: stockCount - previousStock,
          previousStock,
          newStock: stockCount,
          reason,
          admin: 'Admin User',
        }),
      });
    } catch (e) {
      console.warn('Could not log inventory change:', e.message);
    }

    return result;
  },

  async updateThreshold(id, threshold) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lowStockThreshold: parseInt(threshold) }),
    });
    if (!res.ok) throw new Error('Could not update threshold');
    return await res.json();
  },

  async getInventoryHistory() {
    const res = await fetch(`${API_BASE_URL}/inventory/history`);
    if (!res.ok) return { success: true, data: [] };
    return await res.json();
  }
};


const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

export const OrderService = {
  async getOrders(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        queryParams.append(k, v);
      }
    });
    const res = await fetch(`${API_BASE_URL}/orders?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load orders');
    return await res.json();
  },

  async getOrder(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return await res.json();
  },

  async updateOrder(id, orderData) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Could not update order');
    return await res.json();
  },

  async updateCourierDetails(id, courierData) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/courier`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courierData),
    });
    if (!res.ok) throw new Error('Could not update courier details');
    return await res.json();
  },

  async logAdminAction(id, auditData) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/audit-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditData),
    });
    if (!res.ok) throw new Error('Could not log audit action');
    return await res.json();
  },

  async deleteOrder(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Could not delete order');
    return await res.json();
  },

  async bulkUpdateOrders(ids, updateData) {
    const results = [];
    for (const id of ids) {
      const r = await this.updateOrder(id, updateData);
      results.push(r);
    }
    return { success: true, data: results };
  },

  async bulkDeleteOrders(ids) {
    const results = [];
    for (const id of ids) {
      const r = await this.deleteOrder(id);
      results.push(r);
    }
    return { success: true, data: results };
  },
};

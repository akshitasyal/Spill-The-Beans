import { fetchWithAuth } from './apiClient';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

export const OrderService = {
  async getOrders(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        queryParams.append(k, v);
      }
    });
    const res = await fetchWithAuth(`${API_BASE_URL}/orders?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load orders');
    return await res.json();
  },

  async getOrder(id) {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return await res.json();
  },

  async updateOrder(id, orderData) {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Could not update order');
    return await res.json();
  },

  async updateCourierDetails(id, courierData) {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders/${id}/courier`, {
      method: 'PATCH',
      body: JSON.stringify(courierData),
    });
    if (!res.ok) throw new Error('Could not update courier details');
    return await res.json();
  },

  async logAdminAction(id, auditData) {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders/${id}/audit-log`, {
      method: 'POST',
      body: JSON.stringify(auditData),
    });
    if (!res.ok) throw new Error('Could not log audit action');
    return await res.json();
  },

  async deleteOrder(id) {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders/${id}`, {
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

  async retryShipMateDispatch(id) {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders/${id}/retry-shipmate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to dispatch to ShipMate');
    }
    return await res.json();
  },

  async syncShipMateTracking(id) {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders/${id}/sync-shipmate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to sync live tracking from ShipMate');
    }
    return await res.json();
  },

  async sendShipMateTestOrder(referenceId = 'STB-10001') {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders/shipmate-test`, {
      method: 'POST',
      body: JSON.stringify({ referenceId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send test order to ShipMate');
    }
    return await res.json();
  },
};

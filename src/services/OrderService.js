import { initializeMockData } from '../data/adminMockData';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

function getLocalData() {
  const { orders } = initializeMockData();
  const cached = localStorage.getItem('stb_admin_detailed_orders');
  return cached ? JSON.parse(cached) : orders;
}

function saveLocalData(orders) {
  localStorage.setItem('stb_admin_detailed_orders', JSON.stringify(orders));
}

export const OrderService = {
  async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          queryParams.append(k, v);
        }
      });
      const res = await fetch(`${API_BASE_URL}/orders?${queryParams.toString()}`);
      if (!res.ok) throw new Error('API server connection offline');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ OrderService.getOrders falling back to localStorage:', err.message);
      let items = getLocalData();

      const { status, paymentStatus, paymentMethod, search, customerId, amountMin, amountMax, dateStart, dateEnd } = params;

      if (status) {
        items = items.filter(o => o.status === status);
      }
      if (paymentStatus) {
        items = items.filter(o => o.paymentStatus === paymentStatus);
      }
      if (paymentMethod) {
        items = items.filter(o => o.paymentMethod === paymentMethod);
      }
      if (customerId) {
        items = items.filter(o => o.userId === customerId);
      }
      if (amountMin) {
        items = items.filter(o => (o.total / 100) >= Number(amountMin));
      }
      if (amountMax) {
        items = items.filter(o => (o.total / 100) <= Number(amountMax));
      }
      if (dateStart) {
        items = items.filter(o => new Date(o.createdAt) >= new Date(dateStart));
      }
      if (dateEnd) {
        items = items.filter(o => new Date(o.createdAt) <= new Date(dateEnd));
      }

      if (search) {
        const q = search.toLowerCase();
        items = items.filter(o => 
          o.id.toLowerCase().includes(q) || 
          o.customerName.toLowerCase().includes(q) || 
          o.customerEmail.toLowerCase().includes(q) || 
          (o.trackingId && o.trackingId.toLowerCase().includes(q))
        );
      }

      return { success: true, data: items };
    }
  },

  async getOrder(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`);
      if (!res.ok) throw new Error('Order not found on server');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ OrderService.getOrder falling back to localStorage:', err.message);
      const items = getLocalData();
      const order = items.find(o => o.id === id);
      if (!order) throw new Error('Order not found', { cause: err });
      return { success: true, data: order };
    }
  },

  async updateOrder(id, orderData) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error('Could not update order on server');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ OrderService.updateOrder falling back to localStorage:', err.message);
      const items = getLocalData();
      const idx = items.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found', { cause: err });

      const oldOrder = items[idx];
      const updatedTimeline = { ...oldOrder.timeline };

      // Update timeline timestamps dynamically on status changes
      if (orderData.status && orderData.status !== oldOrder.status) {
        const nowStr = new Date().toISOString();
        if (orderData.status === 'PROCESSING') updatedTimeline.processing = nowStr;
        if (orderData.status === 'PACKED') updatedTimeline.packed = nowStr;
        if (orderData.status === 'SHIPPED') updatedTimeline.shipped = nowStr;
        if (orderData.status === 'DELIVERED') updatedTimeline.delivered = nowStr;
      }

      // Check payment status paid confirmation
      if (orderData.paymentStatus === 'PAID' && oldOrder.paymentStatus !== 'PAID') {
        updatedTimeline.confirmed = new Date().toISOString();
      }

      items[idx] = {
        ...oldOrder,
        ...orderData,
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString()
      };

      saveLocalData(items);

      // Log activity to user profile in local storage
      const customersCached = localStorage.getItem('stb_admin_detailed_customers');
      if (customersCached) {
        const customers = JSON.parse(customersCached);
        const cIdx = customers.findIndex(c => c.id === oldOrder.userId);
        if (cIdx !== -1) {
          customers[cIdx].activity.unshift({
            type: 'UPDATE',
            label: `Order #${id} status changed to ${orderData.status || oldOrder.status}`,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('stb_admin_detailed_customers', JSON.stringify(customers));
        }
      }

      return { success: true, data: items[idx] };
    }
  },

  async deleteOrder(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Could not delete order on server');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ OrderService.deleteOrder falling back to localStorage:', err.message);
      let items = getLocalData();
      items = items.filter(o => o.id !== id);
      saveLocalData(items);
      return { success: true };
    }
  },

  // Bulk status updates & processing
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
  }
};

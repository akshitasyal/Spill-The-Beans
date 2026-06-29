import { initializeMockData } from '../data/adminMockData';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

function getLocalData() {
  const { customers } = initializeMockData();
  const cached = localStorage.getItem('stb_admin_detailed_customers');
  return cached ? JSON.parse(cached) : customers;
}

function saveLocalData(customers) {
  localStorage.setItem('stb_admin_detailed_customers', JSON.stringify(customers));
}

export const CustomerService = {
  async getCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      const res = await fetch(`${API_BASE_URL}/customers?${queryParams.toString()}`);
      if (!res.ok) throw new Error('API server connection offline');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CustomerService.getCustomers falling back to localStorage:', err.message);
      let items = getLocalData();

      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
        );
      }

      return { success: true, data: items };
    }
  },

  async getCustomer(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${id}`);
      if (!res.ok) throw new Error('Customer not found on server');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CustomerService.getCustomer falling back to localStorage:', err.message);
      const items = getLocalData();
      const customer = items.find(c => c.id === id);
      if (!customer) throw new Error('Customer not found', { cause: err });

      // Match purchase history dynamically from detailed orders
      const ordersCached = localStorage.getItem('stb_admin_detailed_orders');
      if (ordersCached) {
        const orders = JSON.parse(ordersCached);
        const customerOrders = orders
          .filter(o => o.userId === id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        customer.orders = customerOrders;
        customer.orderCount = customerOrders.length;
        customer.totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
      }

      return { success: true, data: customer };
    }
  },

  async updateCustomer(id, customerData) {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (!res.ok) throw new Error('Could not update customer on server');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CustomerService.updateCustomer falling back to localStorage:', err.message);
      const items = getLocalData();
      const idx = items.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Customer not found', { cause: err });

      items[idx] = {
        ...items[idx],
        ...customerData,
        updatedAt: new Date().toISOString()
      };

      if (customerData.notes !== undefined) {
        items[idx].activity.unshift({
          type: 'NOTE',
          label: 'Updated internal account notes',
          timestamp: new Date().toISOString()
        });
      }

      saveLocalData(items);
      return { success: true, data: items[idx] };
    }
  }
};

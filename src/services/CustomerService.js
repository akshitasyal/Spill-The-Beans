const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

export const CustomerService = {
  async getCustomers(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    const res = await fetch(`${API_BASE_URL}/customers?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load customers');
    return await res.json();
  },

  async getCustomer(id) {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`);
    if (!res.ok) throw new Error('Customer not found');
    return await res.json();
  },

  async updateCustomer(id, customerData) {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    if (!res.ok) throw new Error('Could not update customer');
    return await res.json();
  }
};

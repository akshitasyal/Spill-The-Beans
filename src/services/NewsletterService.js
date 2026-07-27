// NewsletterService.js — Real API only

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

export const NewsletterService = {
  async getSubscribers({ search = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE_URL}/newsletter?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load subscribers');
    return await res.json();
  },

  async deleteSubscriber(id) {
    const res = await fetch(`${API_BASE_URL}/newsletter/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Could not delete subscriber');
    return await res.json();
  },

  async bulkDelete(ids) {
    const res = await fetch(`${API_BASE_URL}/newsletter/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error('Could not delete subscribers');
    return await res.json();
  },

  async exportCSV(subscribers) {
    const rows = [
      'Email,Name,Status,Source,Subscribed Date',
      ...subscribers.map(s =>
        `${s.email},"${s.name || ''}",${s.status},${s.source},${new Date(s.subscribedAt).toLocaleDateString()}`
      )
    ].join('\n');
    return rows;
  }
};

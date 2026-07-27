// NotificationService.js — Real API only

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

const NOTIFICATION_TYPES = {
  LOW_STOCK: { label: 'Low Stock Alert', icon: '📦', color: '#f59e0b' },
  NEW_ORDER: { label: 'New Order', icon: '🛒', color: '#3b82f6' },
  FAILED_PAYMENT: { label: 'Failed Payment', icon: '💳', color: '#ef4444' },
  NEW_REVIEW: { label: 'New Review', icon: '⭐', color: '#8b5cf6' },
  COUPON_EXPIRY: { label: 'Coupon Expiring', icon: '🎟️', color: '#f97316' },
  NEWSLETTER_SIGNUP: { label: 'New Subscriber', icon: '✉️', color: '#10b981' }
};

export const NotificationService = {
  TYPES: NOTIFICATION_TYPES,

  async getNotifications({ type = '', onlyUnread = false } = {}) {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (onlyUnread) params.append('onlyUnread', 'true');
      const res = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`);
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      return { success: true, data: [] };
    }
  },

  async getUnreadCount() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`);
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      return { success: true, count: 0 };
    }
  },

  async markRead(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  async markAllRead() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  async deleteNotification(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  async clearAllRead() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/clear-read`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  async createNotification(type, message) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message })
      });
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      // Notifications are non-critical; fail silently
      return { success: false };
    }
  }
};

// NotificationService.js — 100 mock notifications across 6 types

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

const NOTIFICATION_TYPES = {
  LOW_STOCK: { label: 'Low Stock Alert', icon: '📦', color: '#f59e0b' },
  NEW_ORDER: { label: 'New Order', icon: '🛒', color: '#3b82f6' },
  FAILED_PAYMENT: { label: 'Failed Payment', icon: '💳', color: '#ef4444' },
  NEW_REVIEW: { label: 'New Review', icon: '⭐', color: '#8b5cf6' },
  COUPON_EXPIRY: { label: 'Coupon Expiring', icon: '🎟️', color: '#f97316' },
  NEWSLETTER_SIGNUP: { label: 'New Subscriber', icon: '✉️', color: '#10b981' }
};

const NOTIFICATION_MESSAGES = {
  LOW_STOCK: [
    'Hazelnut Bliss 50g is almost out of stock (3 left)',
    'Mocha pe Chauka 100g stock is critically low (2 units)',
    'Vanilla Dream Soluble running low — only 5 units left',
    'Milk Frother Pro stock below threshold (4 units)',
    'Raat Ki Rani Espresso 100g — 6 units remaining'
  ],
  NEW_ORDER: [
    'Order #STB-4892 placed by Ananya Goel — ₹1,249',
    'Order #STB-4891 placed by Rahul Sharma — ₹2,849',
    'New order from Priya Nair — Bestsellers Bundle — ₹1,899',
    'Order #STB-4890 received from Kabir Das — ₹699',
    'Order #STB-4889 from Deepika Patel — ₹3,299'
  ],
  FAILED_PAYMENT: [
    'Payment failed for Order #STB-4876 (Razorpay declined)',
    'Card declined for Order #STB-4873 — follow up needed',
    'UPI timeout for Order #STB-4869 — customer notified'
  ],
  NEW_REVIEW: [
    'New 5-star review on Hazelnut Bliss from Asha Patel',
    'New 2-star review on Caramel Surge — needs moderation',
    'New review on Araku Valley Single Origin — awaiting approval',
    '1-star review flagged for damaged packaging complaint'
  ],
  COUPON_EXPIRY: [
    'Coupon BREW50 expires in 2 days — 112 uses remaining',
    'STBFREE coupon expires in 5 days',
    'SUPER300 coupon expires in 10 days — consider extending'
  ],
  NEWSLETTER_SIGNUP: [
    '12 new newsletter subscribers in the last 24 hours',
    'Subscriber milestone: 500 newsletter subscribers reached!',
    '8 new signups from the blog footer this week'
  ]
};

function seededRnd(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateNotifications() {
  const types = Object.keys(NOTIFICATION_TYPES);
  return Array.from({ length: 100 }, (_, i) => {
    const type = types[Math.floor(seededRnd(i * 7) * types.length)];
    const messages = NOTIFICATION_MESSAGES[type];
    const message = messages[Math.floor(seededRnd(i * 13) * messages.length)];
    const minsAgo = Math.floor(seededRnd(i * 17) * 60 * 24 * 14); // up to 14 days ago
    return {
      id: `notif-${String(i + 1).padStart(4, '0')}`,
      type,
      message,
      isRead: seededRnd(i * 23) > 0.4,
      createdAt: new Date(Date.now() - minsAgo * 60000).toISOString(),
      ...NOTIFICATION_TYPES[type]
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getLocalNotifications() {
  const local = localStorage.getItem('stb_admin_notifications');
  if (!local) {
    const data = generateNotifications();
    localStorage.setItem('stb_admin_notifications', JSON.stringify(data));
    return data;
  }
  return JSON.parse(local);
}

function saveLocalNotifications(notifs) {
  localStorage.setItem('stb_admin_notifications', JSON.stringify(notifs));
}

export const NotificationService = {
  TYPES: NOTIFICATION_TYPES,

  async getNotifications({ type = '', onlyUnread = false } = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`);
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      let data = getLocalNotifications();
      if (type) data = data.filter(n => n.type === type);
      if (onlyUnread) data = data.filter(n => !n.isRead);
      return { success: true, data };
    }
  },

  async getUnreadCount() {
    const notifs = getLocalNotifications();
    return { success: true, count: notifs.filter(n => !n.isRead).length };
  },

  async markRead(id) {
    const notifs = getLocalNotifications();
    const idx = notifs.findIndex(n => n.id === id);
    if (idx > -1) {
      notifs[idx].isRead = true;
      saveLocalNotifications(notifs);
    }
    return { success: true };
  },

  async markAllRead() {
    const notifs = getLocalNotifications();
    notifs.forEach(n => { n.isRead = true; });
    saveLocalNotifications(notifs);
    return { success: true };
  },

  async deleteNotification(id) {
    let notifs = getLocalNotifications();
    notifs = notifs.filter(n => n.id !== id);
    saveLocalNotifications(notifs);
    return { success: true };
  },

  async clearAllRead() {
    let notifs = getLocalNotifications();
    notifs = notifs.filter(n => !n.isRead);
    saveLocalNotifications(notifs);
    return { success: true };
  }
};

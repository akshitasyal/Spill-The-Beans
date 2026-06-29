// AnalyticsService.js — Generates 12 months of realistic revenue/orders/customer analytics

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

// ─── Seed Generator ──────────────────────────────────────────────────────────
function generateAnalyticsData() {
  const now = new Date();
  const months = [];
  const PRODUCT_NAMES = [
    'Mocha pe Chauka', 'Hazelnut Bliss', 'Vanilla Dream', 'Raat Ki Rani Espresso',
    'Caramel Surge', 'Araku Valley Single Origin', 'Strawberry Bliss', 'Pistachio Luxe',
    'Milk Frother Pro', 'STB Assorted Box', 'Bestsellers Bundle', 'Kacha Aam Cooler'
  ];
  const CATEGORIES = ['Soluble Coffee', 'Espresso Beans', 'Cold Brew', 'Accessories', 'Gift Sets', 'Combos'];

  // Monthly data — last 12 months
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const base = 350000 + Math.round(Math.sin((11 - m) * 0.6) * 120000 + Math.random() * 60000);
    months.push({
      month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      monthFull: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
      revenue: base,
      orders: Math.round(base / 65000 * (0.8 + Math.random() * 0.4) * 10),
      customers: Math.round(base / 65000 * (0.7 + Math.random() * 0.5) * 8),
      newCustomers: Math.round(base / 65000 * (0.4 + Math.random() * 0.3) * 6),
      returns: Math.round(base / 65000 * (Math.random() * 0.8)),
      avgOrderValue: Math.round(base / Math.max(Math.round(base / 65000 * 10), 1))
    });
  }

  // Daily data — last 30 days
  const daily = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now - d * 86400000);
    const dayRevenue = 8000 + Math.round(Math.random() * 22000);
    daily.push({
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: dayRevenue,
      orders: Math.max(1, Math.round(dayRevenue / 6800 * (0.8 + Math.random() * 0.4)))
    });
  }

  // Top products
  const topProducts = PRODUCT_NAMES.slice(0, 8).map((name, i) => ({
    name,
    revenue: Math.round((180000 - i * 18000) + Math.random() * 25000),
    units: Math.round((280 - i * 25) + Math.random() * 40),
    category: CATEGORIES[i % CATEGORIES.length]
  })).sort((a, b) => b.revenue - a.revenue);

  // Category breakdown
  const categoryBreakdown = CATEGORIES.map((cat, i) => ({
    name: cat,
    value: Math.round((280000 - i * 30000) + Math.random() * 50000),
    percent: 0
  }));
  const catTotal = categoryBreakdown.reduce((s, c) => s + c.value, 0);
  categoryBreakdown.forEach(c => { c.percent = Math.round(c.value / catTotal * 100); });

  // Returning vs new customers (last 12 months)
  const returningData = months.map(m => ({
    month: m.month,
    returning: m.customers - m.newCustomers,
    new: m.newCustomers
  }));

  return { months, daily, topProducts, categoryBreakdown, returningData };
}

function getLocalAnalytics() {
  const local = localStorage.getItem('stb_admin_analytics');
  if (!local) {
    const data = generateAnalyticsData();
    localStorage.setItem('stb_admin_analytics', JSON.stringify(data));
    return data;
  }
  return JSON.parse(local);
}

// ─── Service ─────────────────────────────────────────────────────────────────
export const AnalyticsService = {
  async getAnalytics() {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`);
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      const data = getLocalAnalytics();
      return { success: true, data };
    }
  },

  async refreshAnalytics() {
    const data = generateAnalyticsData();
    localStorage.setItem('stb_admin_analytics', JSON.stringify(data));
    return { success: true, data };
  },

  async exportCSV(months) {
    const rows = [
      'Month,Revenue (₹),Orders,Customers,New Customers,Avg Order Value (₹)',
      ...months.map(m =>
        `${m.monthFull},${(m.revenue / 100).toFixed(2)},${m.orders},${m.customers},${m.newCustomers},${(m.avgOrderValue / 100).toFixed(2)}`
      )
    ].join('\n');
    return rows;
  }
};

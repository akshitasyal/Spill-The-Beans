// AnalyticsService.js — Multi-source Live Analytics Engine

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

function normalizeAmount(tot) {
  const val = Number(tot || 0);
  return val > 10000 ? Math.round(val / 100) : Math.round(val);
}

function buildAnalyticsData(orders = []) {
  const now = new Date();
  
  // Only valid, non-cancelled orders
  const validOrders = orders.filter(o => o && o.status !== 'CANCELLED');

  // 12 Months Real Data
  const months = [];
  for (let m = 11; m >= 0; m--) {
    const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - m + 1, 0, 23, 59, 59, 999);
    const label = start.toLocaleString('default', { month: 'short', year: '2-digit' });
    const labelFull = start.toLocaleString('default', { month: 'long', year: 'numeric' });

    const monthOrders = validOrders.filter(o => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });

    const revenue = monthOrders.reduce((s, o) => s + normalizeAmount(o.total), 0);
    const orderCount = monthOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

    const monthCustomers = new Set();
    monthOrders.forEach(o => {
      const email = o.user?.email || o.customerEmail || o.email || o.userId;
      if (email) monthCustomers.add(email);
    });

    months.push({
      month: label,
      monthFull: labelFull,
      revenue,
      orders: orderCount,
      customers: monthCustomers.size,
      newCustomers: monthCustomers.size,
      returns: 0,
      avgOrderValue,
    });
  }

  // 30 Days Real Daily Data
  const daily = [];
  for (let d = 29; d >= 0; d--) {
    const dayStart = new Date(now); dayStart.setDate(now.getDate() - d); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(now); dayEnd.setDate(now.getDate() - d); dayEnd.setHours(23,59,59,999);
    const dateLabel = dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const dayOrders = validOrders.filter(o => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d >= dayStart && d <= dayEnd;
    });

    const dayRevenue = dayOrders.reduce((s, o) => s + normalizeAmount(o.total), 0);
    daily.push({ date: dateLabel, revenue: dayRevenue, orders: dayOrders.length });
  }

  return {
    months,
    daily,
    topProducts: [],
    categoryBreakdown: []
  };
}

export const AnalyticsService = {
  async getAnalytics() {
    let apiOrders = [];
    let _apiCustomers = [];
    try {
      const [oRes, cRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/orders`).then(r => r.json()),
        fetch(`${API_BASE_URL}/customers`).then(r => r.json())
      ]);
      if (oRes.status === 'fulfilled' && oRes.value?.success) {
        apiOrders = oRes.value.data || oRes.value.items || [];
      }
      if (cRes.status === 'fulfilled' && cRes.value?.success) {
        _apiCustomers = cRes.value.data || [];
      }
    } catch (_e) {}

    let placedOrders = [];
    let adminOrders = [];
    try {
      placedOrders = Object.values(JSON.parse(localStorage.getItem('stb_placed_orders') || '{}'));
    } catch (_e) {}
    try {
      adminOrders = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
    } catch (_e) {}

    const orderMap = {};
    apiOrders.forEach(o => { if (o && o.id) orderMap[o.id] = o; });
    placedOrders.forEach(o => { if (o && o.id) orderMap[o.id] = { ...orderMap[o.id], ...o }; });
    adminOrders.forEach(o => { if (o && o.id) orderMap[o.id] = { ...orderMap[o.id], ...o }; });

    const allOrders = Object.values(orderMap);
    const analyticsData = buildAnalyticsData(allOrders);

    return { success: true, data: analyticsData };
  },

  async refreshAnalytics() {
    return this.getAnalytics();
  },

  async exportCSV(months = []) {
    const rows = [
      'Month,Revenue (₹),Orders,Customers,New Customers,Avg Order Value (₹)',
      ...months.map(m =>
        `${m.monthFull},${m.revenue.toFixed(2)},${m.orders},${m.customers},${m.newCustomers},${m.avgOrderValue.toFixed(2)}`
      )
    ].join('\n');
    return rows;
  }
};

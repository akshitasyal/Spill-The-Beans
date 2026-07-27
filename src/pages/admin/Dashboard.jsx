import { useState, useEffect } from 'react';
import { SectionHeader } from './AdminLayout';
import {
  TrendingUp, ShoppingBag, Coffee, Users, AlertTriangle, Clock,
  PackagePlus, FileText, Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

// Reusable KPI Card Component
function KPICard({ title, value, icon: Icon, loading }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__header">
        <span className="kpi-card__title">{title}</span>
        <div className="kpi-card__icon-wrap">
          <Icon size={18} />
        </div>
      </div>
      <div className="kpi-card__body">
        <span className="kpi-card__value">
          {loading ? (
            <span style={{ opacity: 0.3, fontSize: '1rem' }}>Loading…</span>
          ) : value}
        </span>
      </div>
    </div>
  );
}

// Reusable Recent Orders Table Component
function RecentOrdersTable({ orders = [], loading }) {
  return (
    <div className="recent-orders-card">
      <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.0625rem', fontWeight: 600 }}>Recent Orders</h3>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4, fontSize: '0.875rem' }}>Loading…</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4, fontSize: '0.875rem' }}>No orders yet.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>{o.id}</td>
                <td>{o.customerName || o.user?.name || '—'}</td>
                <td>
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((o.total || 0) > 10000 ? (o.total || 0) / 100 : (o.total || 0))}
                </td>
                <td>
                  <span className={`status-badge status-badge--${(o.status || '').toLowerCase()}`}>
                    {o.status}
                  </span>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                <td>
                  <Link to={`/admin/orders/${o.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '4px', textDecoration: 'none' }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Quick Actions Shortcut Panel
function QuickActionsPanel() {
  const shortcuts = [
    { title: 'Add Product', icon: PackagePlus, path: '/admin/products' },
    { title: 'Manage Orders', icon: ShoppingBag, path: '/admin/orders' },
    { title: 'Create Coupon', icon: Ticket, path: '/admin/coupons' },
    { title: 'Write Blog', icon: FileText, path: '/admin/blogs' },
    { title: 'View Inventory', icon: Coffee, path: '/admin/inventory' },
  ];

  return (
    <div className="quick-actions-card">
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.0625rem', fontWeight: 600 }}>Quick Actions</h3>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-admin-muted)' }}>Shortcut triggers to speed up daily operations.</p>
      <div className="quick-actions-grid">
        {shortcuts.map((s, idx) => (
          <Link key={idx} to={s.path} className="quick-action-btn">
            <s.icon size={22} color="var(--accent-admin-amber)" />
            <span>{s.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Low Stock Alerts Panel (real data)
function AlertsPanel({ lowStockProducts = [], loading }) {
  return (
    <div className="notification-card">
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.0625rem', fontWeight: 600 }}>Low Stock Alerts</h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: 'var(--text-admin-muted)' }}>Products running low on inventory.</p>
      <div className="notification-list">
        {loading ? (
          <div style={{ opacity: 0.4, fontSize: '0.8125rem' }}>Loading…</div>
        ) : lowStockProducts.length === 0 ? (
          <div style={{ opacity: 0.4, fontSize: '0.8125rem' }}>All products are well-stocked.</div>
        ) : lowStockProducts.map((p, idx) => (
          <div key={idx} className="notification-item">
            <div className="notification-item__icon-wrap" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
              <AlertTriangle size={16} />
            </div>
            <div className="notification-item__content">
              <h4 className="notification-item__title">{p.name}</h4>
              <p className="notification-item__desc">{p.stock} units remaining (SKU: {p.sku || '—'})</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: '—',
    ordersToday: '—',
    productsActive: '—',
    totalCustomers: '—',
    pendingOrders: '—',
    lowStockCount: '—',
    recentOrders: [],
    lowStockProducts: []
  });

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/orders`).then(r => r.json()),
          fetch(`${API_BASE_URL}/customers`).then(r => r.json()),
          fetch(`${API_BASE_URL}/inventory`).then(r => r.json()),
        ]);

        const orders = ordersRes.status === 'fulfilled' && ordersRes.value.success ? ordersRes.value.data : [];
        const customers = customersRes.status === 'fulfilled' && customersRes.value.success ? customersRes.value.data : [];
        const products = productsRes.status === 'fulfilled' && productsRes.value.success ? productsRes.value.data : [];

        // Revenue from active/placed orders
        const revTotal = orders.reduce((acc, o) => {
          if (o.status !== 'CANCELLED') {
            const tot = o.total || 0;
            const rupees = tot > 10000 ? tot / 100 : tot;
            return acc + rupees;
          }
          return acc;
        }, 0);
        const totalRevenue = new Intl.NumberFormat('en-IN', {
          style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(Math.round(revTotal));

        // Orders placed today
        const todayStr = new Date().toDateString();
        const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr).length;

        // Pending/in-progress orders
        const pendingOrders = orders.filter(o =>
          ['PENDING', 'PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED'].includes(o.status)
        ).length;

        // Low stock products (stock <= threshold or stock <= 15)
        const LOW_THRESHOLD = 15;
        const lowStockProducts = products.filter(p => p.stock !== null && p.stock <= LOW_THRESHOLD);

        // Recent 5 orders
        const recentOrders = orders.slice(0, 5);

        setStats({
          totalRevenue,
          ordersToday,
          productsActive: products.length,
          totalCustomers: customers.length,
          pendingOrders,
          lowStockCount: lowStockProducts.length,
          recentOrders,
          lowStockProducts: lowStockProducts.slice(0, 4)
        });
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle="Overview of store operations and live statistics." />

      <div className="dashboard-grid">
        {/* Row 1: KPI Cards */}
        <div className="dashboard-kpi-row">
          <KPICard title="Total Revenue" value={stats.totalRevenue} icon={TrendingUp} loading={loading} />
          <KPICard title="Orders Today" value={stats.ordersToday} icon={ShoppingBag} loading={loading} />
          <KPICard title="Products Active" value={stats.productsActive} icon={Coffee} loading={loading} />
          <KPICard title="Total Customers" value={stats.totalCustomers} icon={Users} loading={loading} />
          <KPICard title="Pending Orders" value={stats.pendingOrders} icon={Clock} loading={loading} />
          <KPICard title="Low Stock" value={stats.lowStockCount} icon={AlertTriangle} loading={loading} />
        </div>

        {/* Row 2: Recent Orders Table */}
        <RecentOrdersTable orders={stats.recentOrders} loading={loading} />

        {/* Row 3: Quick Actions & Low Stock Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }} className="mobile-stacked-row">
          <QuickActionsPanel />
          <AlertsPanel lowStockProducts={stats.lowStockProducts} loading={loading} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-stacked-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

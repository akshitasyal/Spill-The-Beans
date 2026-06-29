import { SectionHeader } from './AdminLayout';
import {
  TrendingUp, ShoppingBag, Coffee, Users, AlertTriangle, Clock,
  ArrowUpRight, ArrowDownRight, PackagePlus, FileText, Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Reusable KPI Card Component
function KPICard({ title, value, icon: Icon, trend, trendValue, isUp }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__header">
        <span className="kpi-card__title">{title}</span>
        <div className="kpi-card__icon-wrap">
          <Icon size={18} />
        </div>
      </div>
      <div className="kpi-card__body">
        <span className="kpi-card__value">{value}</span>
        <span className={`kpi-card__trend ${isUp ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue} ({trend})
        </span>
      </div>
    </div>
  );
}

// Reusable SVG Chart Component
function DashboardChart({ title, type }) {
  if (type === 'revenue') {
    return (
      <div className="chart-card">
        <div className="chart-card__header">
          <h3 className="chart-card__title">{title}</h3>
        </div>
        <div className="chart-card__svg-container">
          {/* Custom SVG line chart for Revenue */}
          <svg viewBox="0 0 400 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C27A0A" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C27A0A" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <grid>
              <line x1="0" y1="160" x2="400" y2="160" stroke="rgba(253,224,193,0.05)" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(253,224,193,0.05)" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(253,224,193,0.05)" />
              <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(253,224,193,0.05)" />
            </grid>
            {/* Area Path */}
            <path
              d="M 0 170 C 40 160, 80 120, 120 130 C 160 140, 200 90, 240 70 C 280 50, 320 60, 360 40 L 360 200 L 0 200 Z"
              fill="url(#chart-grad)"
            />
            {/* Line Path */}
            <path
              d="M 0 170 C 40 160, 80 120, 120 130 C 160 140, 200 90, 240 70 C 280 50, 320 60, 360 40"
              fill="none"
              stroke="#C27A0A"
              strokeWidth="3"
            />
            {/* Data Dots */}
            <circle cx="120" cy="130" r="4" fill="#C27A0A" />
            <circle cx="240" cy="70" r="4" fill="#C27A0A" />
            <circle cx="360" cy="40" r="4" fill="#C27A0A" />
            {/* X-axis tags */}
            <text x="10" y="195" fill="rgba(253,224,193,0.3)" fontSize="10">Jan</text>
            <text x="120" y="195" fill="rgba(253,224,193,0.3)" fontSize="10">Mar</text>
            <text x="240" y="195" fill="rgba(253,224,193,0.3)" fontSize="10">May</text>
            <text x="350" y="195" fill="rgba(253,224,193,0.3)" fontSize="10">Jul</text>
          </svg>
        </div>
      </div>
    );
  }

  // Else bar chart for sales categories
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">{title}</h3>
      </div>
      <div className="chart-card__svg-container">
        {/* Custom SVG Bar Chart */}
        <svg viewBox="0 0 400 200" width="100%" height="100%">
          {/* Bars */}
          {/* Instant Coffee */}
          <rect x="50" y="40" width="30" height="130" rx="4" fill="#581312" />
          <text x="50" y="188" fill="rgba(253,224,193,0.3)" fontSize="10">Instant</text>
          <text x="55" y="32" fill="#FDE0C1" fontSize="9" fontWeight="600">65%</text>

          {/* Whole Beans */}
          <rect x="150" y="70" width="30" height="100" rx="4" fill="#C27A0A" />
          <text x="148" y="188" fill="rgba(253,224,193,0.3)" fontSize="10">Whole Beans</text>
          <text x="155" y="62" fill="#FDE0C1" fontSize="9" fontWeight="600">45%</text>

          {/* Gift Hampers */}
          <rect x="250" y="110" width="30" height="60" rx="4" fill="#A38F85" />
          <text x="250" y="188" fill="rgba(253,224,193,0.3)" fontSize="10">Gifts</text>
          <text x="255" y="102" fill="#FDE0C1" fontSize="9" fontWeight="600">22%</text>

          {/* Accessories */}
          <rect x="330" y="130" width="30" height="40" rx="4" fill="rgba(253,224,193,0.08)" stroke="rgba(253,224,193,0.15)" />
          <text x="328" y="188" fill="rgba(253,224,193,0.3)" fontSize="10">Frothers</text>
          <text x="335" y="122" fill="#FDE0C1" fontSize="9" fontWeight="600">12%</text>
        </svg>
      </div>
    </div>
  );
}

// Reusable Recent Orders Table Component
function RecentOrdersTable() {
  const mockOrders = [
    { id: '#STB-4819', customer: 'Aryan Sharma', amount: '₹1,249', status: 'delivered', date: 'Jun 27, 2026' },
    { id: '#STB-4818', customer: 'Deepika Rao', amount: '₹849', status: 'pending', date: 'Jun 27, 2026' },
    { id: '#STB-4817', customer: 'Kabir Mehta', amount: '₹2,150', status: 'shipped', date: 'Jun 26, 2026' },
    { id: '#STB-4816', customer: 'Ananya Goel', amount: '₹599', status: 'delivered', date: 'Jun 25, 2026' },
    { id: '#STB-4815', customer: 'Vikram Singh', amount: '₹1,100', status: 'cancelled', date: 'Jun 25, 2026' },
  ];

  return (
    <div className="recent-orders-card">
      <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.0625rem', fontWeight: 600 }}>Recent Transactions</h3>
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
          {mockOrders.map((o) => (
            <tr key={o.id}>
              <td style={{ fontWeight: 600 }}>{o.id}</td>
              <td>{o.customer}</td>
              <td>{o.amount}</td>
              <td>
                <span className={`status-badge status-badge--${o.status}`}>
                  {o.status}
                </span>
              </td>
              <td>{o.date}</td>
              <td>
                <Link to="/admin/orders" className="btn btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '4px', textDecoration: 'none' }}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Reusable Shortcut Quick Actions Component
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

// Mock Alerts / Notifications panel
function AlertsPanel() {
  const alerts = [
    { title: 'Low Stock Alert', desc: 'Raat Ki Rani Espresso is under 10 units in warehouse A.', time: '10 min ago', color: '#d32f2f', bg: 'rgba(211,47,47,0.1)' },
    { title: 'New Customer Joined', desc: 'A new user registered from Nilgiri Hills region.', time: '1 hr ago', color: '#0288d1', bg: 'rgba(2,136,209,0.1)' },
    { title: 'Fulfillment Pending', desc: '4 orders from yesterday require courier parcel scans.', time: '3 hrs ago', color: 'var(--accent-admin-amber)', bg: 'rgba(194,122,10,0.1)' },
  ];

  return (
    <div className="notification-card">
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.0625rem', fontWeight: 600 }}>Operational Alerts</h3>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-admin-muted)' }}>Notifications requiring immediate review.</p>
      <div className="notification-list">
        {alerts.map((a, idx) => (
          <div key={idx} className="notification-item">
            <div className="notification-item__icon-wrap" style={{ background: a.bg, color: a.color }}>
              <AlertTriangle size={16} />
            </div>
            <div className="notification-item__content">
              <h4 className="notification-item__title">{a.title}</h4>
              <p className="notification-item__desc">{a.desc}</p>
              <span className="notification-item__time">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div>
      <SectionHeader title="Dashboard" subtitle="Overview of Spill The Beans operations and store analytics." />

      <div className="dashboard-grid">
        {/* Row 1: KPI Cards */}
        <div className="dashboard-kpi-row">
          <KPICard
            title="Total Revenue"
            value="₹4,28,490"
            icon={TrendingUp}
            trend="+12.4%"
            trendValue="₹48,200"
            isUp={true}
          />
          <KPICard
            title="Orders Today"
            value="38"
            icon={ShoppingBag}
            trend="+8.2%"
            trendValue="3"
            isUp={true}
          />
          <KPICard
            title="Products Active"
            value="14"
            icon={Coffee}
            trend="+0.0%"
            trendValue="0"
            isUp={true}
          />
          <KPICard
            title="Total Customers"
            value="1,482"
            icon={Users}
            trend="+15.1%"
            trendValue="184"
            isUp={true}
          />
          <KPICard
            title="Pending Orders"
            value="6"
            icon={Clock}
            trend="-25.0%"
            trendValue="2"
            isUp={false}
          />
          <KPICard
            title="Low Stock"
            value="1"
            icon={AlertTriangle}
            trend="+0.0%"
            trendValue="0"
            isUp={true}
          />
        </div>

        {/* Row 2: Charts */}
        <div className="dashboard-charts-row">
          <DashboardChart title="Revenue Trends (Last 6 Months)" type="revenue" />
          <DashboardChart title="Product Categories (Sales %)" type="categories" />
        </div>

        {/* Row 3: Recent Orders Table */}
        <RecentOrdersTable />

        {/* Row 4: Quick Actions & Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }} className="mobile-stacked-row">
          <QuickActionsPanel />
          <AlertsPanel />
        </div>
      </div>
      
      {/* Mobile Stack helper stylesheet overrides */}
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

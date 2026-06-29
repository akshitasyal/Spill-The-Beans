import { useState, useEffect } from 'react';
import { SectionHeader } from './AdminLayout';
import { Clock, User, Package, ShoppingBag, Ticket, FileText, Star, Settings, LogIn } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

// Activity Types with metadata
const ACTIVITY_TYPES = {
  LOGIN: { label: 'Admin Login', icon: LogIn, color: '#3b82f6' },
  PRODUCT_CREATED: { label: 'Product Created', icon: Package, color: '#10b981' },
  PRODUCT_UPDATED: { label: 'Product Updated', icon: Package, color: '#f59e0b' },
  ORDER_UPDATED: { label: 'Order Updated', icon: ShoppingBag, color: '#8b5cf6' },
  COUPON_CREATED: { label: 'Coupon Created', icon: Ticket, color: '#f97316' },
  BLOG_PUBLISHED: { label: 'Blog Published', icon: FileText, color: '#14b8a6' },
  REVIEW_APPROVED: { label: 'Review Approved', icon: Star, color: '#ec4899' },
  SETTINGS_CHANGED: { label: 'Settings Changed', icon: Settings, color: '#6b7280' }
};

const ADMIN_NAMES = ['You (Super Admin)', 'Rahul Sharma (Admin)', 'Priya Nair (Manager)'];

const ACTIVITY_DETAILS = {
  LOGIN: ['Logged in from Chrome on Windows', 'Logged in from Safari on iPhone', 'New login from Bengaluru, India'],
  PRODUCT_CREATED: ['Created Pistachio Luxe 50g', 'Added Nilgiri Cold Brew 200ml', 'New product: STB Premium Gift Box'],
  PRODUCT_UPDATED: ['Updated stock for Mocha pe Chauka', 'Changed price of Hazelnut Bliss 100g', 'Updated images for Vanilla Dream'],
  ORDER_UPDATED: ['Marked Order #STB-4892 as Shipped', 'Updated tracking for Order #STB-4880', 'Changed Order #STB-4876 status to Delivered'],
  COUPON_CREATED: ['Created coupon MONSOON20', 'Added WELCOME10 — 10% discount', 'New free shipping coupon STBFREE2'],
  BLOG_PUBLISHED: ['Published: Cold Brew Guide for Beginners', 'Published: Araku Valley Origins Story', 'Blog post updated: Protein Coffee Recipe'],
  REVIEW_APPROVED: ['Approved review on Mocha pe Chauka', 'Rejected 1-star review for damaged packaging', 'Approved 5-star review on Araku Valley'],
  SETTINGS_CHANGED: ['Updated GST settings to 18%', 'Changed store email to hello@spillthebeans.in', 'Enabled maintenance mode']
};

function seededRnd(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateActivityLogs() {
  const types = Object.keys(ACTIVITY_TYPES);
  const ips = ['103.21.58.142', '49.36.214.88', '157.49.80.9', '223.236.19.24', '49.37.192.150'];

  return Array.from({ length: 120 }, (_, i) => {
    const type = types[Math.floor(seededRnd(i * 7) * types.length)];
    const details = ACTIVITY_DETAILS[type];
    const detail = details[Math.floor(seededRnd(i * 11) * details.length)];
    const minsAgo = Math.floor(seededRnd(i * 13) * 60 * 24 * 30); // up to 30 days
    return {
      id: `log-${String(i + 1).padStart(4, '0')}`,
      type,
      admin: ADMIN_NAMES[Math.floor(seededRnd(i * 17) * ADMIN_NAMES.length)],
      detail,
      ip: ips[Math.floor(seededRnd(i * 19) * ips.length)],
      createdAt: new Date(Date.now() - minsAgo * 60000).toISOString()
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getLocalLogs() {
  const local = localStorage.getItem('stb_admin_activity_logs');
  if (!local) {
    const data = generateActivityLogs();
    localStorage.setItem('stb_admin_activity_logs', JSON.stringify(data));
    return data;
  }
  return JSON.parse(local);
}

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setTimeout(() => {
      if (active) {
        let data = getLocalLogs();
        setLogs(data);
        setLoading(false);
      }
    }, 300);
    return () => { active = false; };
  }, []);

  const filtered = logs.filter(l => {
    const matchType = !typeFilter || l.type === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || l.detail.toLowerCase().includes(q) || l.admin.toLowerCase().includes(q) || l.ip.includes(q);
    return matchType && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <SectionHeader title="Activity Logs" subtitle={`${logs.length} admin actions recorded. Audit trail for all administrative operations.`} />

      {/* Filters */}
      <div style={filterRow}>
        <div style={searchWrap}>
          <input type="text" placeholder="Search actions, admin, IP address…" style={searchInput} value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <select style={selectEl} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Actions</option>
          {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="recent-orders-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div style={emptyState}>
            <Clock size={32} color="var(--text-admin-muted)" />
            <p style={{ color: 'var(--text-admin-muted)', fontSize: '0.875rem' }}>No activity logs match your filter.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Details</th>
                <th>Admin</th>
                <th>IP Address</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(log => {
                const meta = ACTIVITY_TYPES[log.type];
                const Icon = meta?.icon || Clock;
                return (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ ...typeIcon, background: (meta?.color || '#888') + '18', color: meta?.color || '#888' }}>
                          <Icon size={13} />
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-admin-bright)' }}>{meta?.label || log.type}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '0.8125rem', color: 'var(--text-admin-muted)' }}>{log.detail}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                        <User size={12} color="var(--text-admin-muted)" />
                        <span style={{ color: 'var(--text-admin-bright)' }}>{log.admin}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>{log.ip}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)', whiteSpace: 'nowrap' }}>
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationRow}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={pageBtn} disabled={currentPage === 1}>Prev</button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} style={(i + 1) === currentPage ? activePgBtn : pageBtn}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={pageBtn} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ height: '14px', background: 'rgba(253,224,193,0.04)', borderRadius: '4px', width: `${50 + (i % 5) * 10}%` }} />
      ))}
    </div>
  );
}

// Styles
const filterRow = { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' };
const searchWrap = { flex: 1, minWidth: '220px', maxWidth: '420px' };
const searchInput = { width: '100%', padding: '0.45rem 0.75rem', background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box' };
const selectEl = { padding: '0.45rem 0.6rem', background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem', outline: 'none', cursor: 'pointer' };
const typeIcon = { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const emptyState = { padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' };
const paginationRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' };
const pageBtn = { background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' };
const activePgBtn = { background: 'var(--accent-admin-amber)', border: 'none', color: '#FFF', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' };

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package, ShoppingBag, Users, FileText, Ticket, Star } from 'lucide-react';

// Global data search across all admin resources
async function searchAll(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase();
  const results = [];

  // Products from localStorage
  try {
    const prods = JSON.parse(localStorage.getItem('stb_admin_products') || '[]');
    prods.filter(p => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach(p => results.push({ type: 'product', icon: Package, label: p.name, sub: `SKU: ${p.sku || '—'}`, href: `/admin/products/${p.id}/edit` }));
  } catch { /* ignore */ }

  // Orders from localStorage
  try {
    const orders = JSON.parse(localStorage.getItem('stb_admin_detailed_orders') || '[]');
    orders.filter(o => o.id?.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q) || o.customerEmail?.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach(o => results.push({ type: 'order', icon: ShoppingBag, label: `Order #${o.id}`, sub: `${o.customerName} · ₹${(o.total / 100).toFixed(0)}`, href: `/admin/orders/${o.id}` }));
  } catch { /* ignore */ }

  // Customers from localStorage
  try {
    const customers = JSON.parse(localStorage.getItem('stb_admin_detailed_customers') || '[]');
    customers.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach(c => results.push({ type: 'customer', icon: Users, label: c.name, sub: c.email, href: `/admin/customers/${c.id}` }));
  } catch { /* ignore */ }

  // Blogs from localStorage
  try {
    const blogs = JSON.parse(localStorage.getItem('stb_admin_blogs') || '[]');
    blogs.filter(b => b.title?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(b => results.push({ type: 'blog', icon: FileText, label: b.title, sub: `/${b.slug}`, href: `/admin/blog/${b.id}/edit` }));
  } catch { /* ignore */ }

  // Coupons from localStorage
  try {
    const coupons = JSON.parse(localStorage.getItem('stb_admin_coupons') || '[]');
    coupons.filter(c => c.code?.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(c => results.push({ type: 'coupon', icon: Ticket, label: c.code, sub: `${c.type} · ${c.isActive ? 'Active' : 'Inactive'}`, href: '/admin/coupons' }));
  } catch { /* ignore */ }

  // Reviews from localStorage
  try {
    const reviews = JSON.parse(localStorage.getItem('stb_admin_reviews') || '[]');
    reviews.filter(r => r.title?.toLowerCase().includes(q) || r.user?.name?.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(r => results.push({ type: 'review', icon: Star, label: r.title, sub: `by ${r.user?.name} · ${r.product?.name}`, href: '/admin/reviews' }));
  } catch { /* ignore */ }

  return results;
}

const TYPE_COLORS = {
  product: '#3b82f6',
  order: '#8b5cf6',
  customer: '#10b981',
  blog: '#f59e0b',
  coupon: '#f97316',
  review: '#ec4899'
};

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await searchAll(q);
    setResults(res);
    setActiveIdx(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 220);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const handleSelect = (result) => {
    navigate(result.href);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) handleSelect(results[activeIdx]);
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div style={inputRow}>
          <Search size={18} style={{ color: 'var(--text-admin-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, orders, customers, blogs, coupons…"
            style={searchInput}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button onClick={() => setQuery('')} style={clearBtn}>
              <X size={14} />
            </button>
          )}
          <kbd style={escKbd}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={resultsArea}>
          {loading && (
            <div style={loadingRow}>Searching…</div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div style={emptyRow}>
              <span style={{ fontSize: '1.5rem' }}>🔍</span>
              <span>No results for &ldquo;{query}&rdquo;</span>
            </div>
          )}
          {!loading && results.length > 0 && (
            <ul style={resultList}>
              {results.map((r, i) => {
                const Icon = r.icon;
                const color = TYPE_COLORS[r.type] || 'var(--accent-admin-amber)';
                return (
                  <li
                    key={i}
                    style={{ ...resultItem, background: i === activeIdx ? 'rgba(253,224,193,0.06)' : 'transparent' }}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <div style={{ ...typeIcon, background: color + '18', color }}>
                      <Icon size={14} />
                    </div>
                    <div style={resultText}>
                      <div style={resultLabel}>{r.label}</div>
                      <div style={resultSub}>{r.sub}</div>
                    </div>
                    <div style={{ ...typeBadge, color, background: color + '14' }}>{r.type}</div>
                  </li>
                );
              })}
            </ul>
          )}
          {!query && (
            <div style={hintArea}>
              <p style={hintTitle}>Quick Navigate</p>
              <div style={hintGrid}>
                {[
                  { label: 'Products', href: '/admin/products', icon: '📦' },
                  { label: 'Orders', href: '/admin/orders', icon: '🛒' },
                  { label: 'Customers', href: '/admin/customers', icon: '👤' },
                  { label: 'Analytics', href: '/admin/analytics', icon: '📊' },
                  { label: 'Blog', href: '/admin/blog', icon: '✍️' },
                  { label: 'Coupons', href: '/admin/coupons', icon: '🎟️' }
                ].map(h => (
                  <button key={h.href} onClick={() => { navigate(h.href); onClose(); }} style={hintBtn}>
                    <span>{h.icon}</span> {h.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footer}>
          <span style={footerHint}><kbd style={kbd}>↑↓</kbd> navigate</span>
          <span style={footerHint}><kbd style={kbd}>↵</kbd> open</span>
          <span style={footerHint}><kbd style={kbd}>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

// Styles
const backdrop = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(8, 3, 3, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  paddingTop: '10vh'
};

const modal = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '16px',
  width: '90%', maxWidth: '620px',
  maxHeight: '70vh',
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
  overflow: 'hidden'
};

const inputRow = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '1rem 1.25rem',
  borderBottom: '1px solid var(--border-admin)'
};

const searchInput = {
  flex: 1, background: 'none', border: 'none',
  color: 'var(--text-admin-bright)', fontSize: '1rem',
  outline: 'none', fontFamily: 'inherit'
};

const clearBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-admin-muted)', display: 'flex', alignItems: 'center'
};

const escKbd = {
  background: 'rgba(253,224,193,0.06)',
  border: '1px solid var(--border-admin)',
  borderRadius: '4px', padding: '0.1rem 0.4rem',
  fontSize: '0.7rem', color: 'var(--text-admin-muted)',
  fontFamily: 'monospace'
};

const resultsArea = {
  flex: 1, overflowY: 'auto',
  minHeight: '120px', maxHeight: '45vh'
};

const loadingRow = {
  padding: '2rem', textAlign: 'center',
  color: 'var(--text-admin-muted)', fontSize: '0.875rem'
};

const emptyRow = {
  padding: '2.5rem', textAlign: 'center',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
  color: 'var(--text-admin-muted)', fontSize: '0.875rem'
};

const resultList = { listStyle: 'none', margin: 0, padding: '0.5rem' };

const resultItem = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer'
};

const typeIcon = {
  width: '30px', height: '30px', borderRadius: '8px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
};

const resultText = { flex: 1, minWidth: 0 };
const resultLabel = { fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-admin-bright)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const resultSub = { fontSize: '0.7rem', color: 'var(--text-admin-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const typeBadge = {
  fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
  padding: '0.1rem 0.4rem', borderRadius: '4px', flexShrink: 0
};

const hintArea = { padding: '1.25rem' };
const hintTitle = { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-admin-muted)', letterSpacing: '0.5px', margin: '0 0 0.75rem 0' };
const hintGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' };
const hintBtn = {
  background: 'rgba(253,224,193,0.03)', border: '1px solid var(--border-admin)',
  borderRadius: '8px', padding: '0.5rem', cursor: 'pointer',
  color: 'var(--text-admin-bright)', fontSize: '0.8125rem',
  display: 'flex', alignItems: 'center', gap: '0.4rem'
};

const footer = {
  display: 'flex', gap: '1rem', padding: '0.75rem 1.25rem',
  borderTop: '1px solid var(--border-admin)'
};
const footerHint = { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-admin-muted)' };
const kbd = {
  background: 'rgba(253,224,193,0.06)', border: '1px solid var(--border-admin)',
  borderRadius: '3px', padding: '0.1rem 0.35rem', fontSize: '0.65rem', fontFamily: 'monospace'
};

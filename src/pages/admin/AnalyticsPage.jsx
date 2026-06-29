import { useState, useEffect, useCallback } from 'react';
import { AnalyticsService } from '../../services/AnalyticsService';
import { SectionHeader } from './AdminLayout';
import { RefreshCw, Download, TrendingUp, ShoppingBag, Users, CreditCard, Percent, ArrowUpRight, Package, Star } from 'lucide-react';

const DATE_RANGES = ['monthly', 'daily', 'yearly'];

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function SvgLineChart({ data, valueKey, color = '#c27a0a', height = 140 }) {
  if (!data || data.length === 0) return null;
  const values = data.map(d => d[valueKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 600, H = height;
  const pad = { top: 10, right: 10, bottom: 24, left: 10 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const points = values.map((v, i) => ({
    x: pad.left + (i / (values.length - 1)) * innerW,
    y: pad.top + (1 - (v - min) / range) * innerH
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = pathD + ` L${points[points.length - 1].x.toFixed(1)},${(pad.top + innerH).toFixed(1)} L${pad.left.toFixed(1)},${(pad.top + innerH).toFixed(1)} Z`;
  const gradId = `grad-${color.replace('#', '')}-${valueKey}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: `${height}px` }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} opacity="0.7" />
      ))}
      {/* x-axis labels — every 3rd */}
      {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i, arr) => {
        const origIdx = data.indexOf(d);
        return (
          <text key={i} x={points[origIdx]?.x || 0} y={H - 4} fontSize="9" fill="#7b6e63" textAnchor="middle">
            {d.month || d.date || ''}
          </text>
        );
      })}
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function SvgBarChart({ data, valueKey, color = '#c27a0a', height = 140 }) {
  if (!data || data.length === 0) return null;
  const values = data.map(d => d[valueKey]);
  const max = Math.max(...values) || 1;
  const W = 600, H = height;
  const pad = { top: 10, right: 10, bottom: 24, left: 10 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const barW = Math.max(4, (innerW / values.length) - 3);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: `${height}px` }}>
      {values.map((v, i) => {
        const barH = (v / max) * innerH;
        const x = pad.left + (i / values.length) * innerW + 1;
        const y = pad.top + innerH - barH;
        const d = data[i];
        return (
          <rect key={i} x={x} y={y} width={barW} height={barH}
            fill={color} opacity="0.75" rx="2" />
        );
      })}
      {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => {
        const origIdx = data.indexOf(d);
        const x = pad.left + (origIdx / values.length) * innerW + barW / 2;
        return (
          <text key={i} x={x} y={H - 4} fontSize="9" fill="#7b6e63" textAnchor="middle">
            {d.month || d.date || ''}
          </text>
        );
      })}
    </svg>
  );
}

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────
function SvgDonutChart({ data, height = 140 }) {
  const COLORS = ['#c27a0a', '#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ec4899'];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 70, cy = 70, r = 50, ri = 32;
  let angle = -90;

  const arcs = data.slice(0, 6).map((d, i) => {
    const pct = d.value / total;
    const sweep = pct * 360;
    const startAngle = angle;
    angle += sweep;
    const endAngle = angle;
    const toRad = a => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const xi1 = cx + ri * Math.cos(toRad(startAngle));
    const yi1 = cy + ri * Math.sin(toRad(startAngle));
    const xi2 = cx + ri * Math.cos(toRad(endAngle));
    const yi2 = cy + ri * Math.sin(toRad(endAngle));
    const large = sweep > 180 ? 1 : 0;
    return { d: `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${ri},${ri} 0 ${large},0 ${xi1.toFixed(2)},${yi1.toFixed(2)} Z`, color: COLORS[i], name: d.name, pct: Math.round(pct * 100) };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <svg viewBox="0 0 140 140" style={{ width: `${height}px`, height: `${height}px`, flexShrink: 0 }}>
        {arcs.map((arc, i) => (
          <path key={i} d={arc.d} fill={arc.color} opacity="0.9" />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {arcs.map((arc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: arc.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-admin-bright)', flex: 1 }}>{arc.name}</span>
            <span style={{ color: 'var(--text-admin-muted)', fontWeight: 600 }}>{arc.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, change, changeLabel, color }) {
  const isPositive = change >= 0;
  return (
    <div style={kpiCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ ...kpiIconBox, background: color + '18', color }}>{icon}</div>
        <div style={{ ...changeBadge, color: isPositive ? '#10b981' : '#ef4444', background: isPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
          <ArrowUpRight size={11} style={{ transform: isPositive ? 'none' : 'rotate(180deg)' }} />
          {Math.abs(change)}%
        </div>
      </div>
      <div style={kpiValue}>{value}</div>
      <div style={kpiLabel}>{label}</div>
      <div style={kpiSub}>{changeLabel}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    AnalyticsService.getAnalytics().then(res => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let active = true;
    AnalyticsService.getAnalytics().then(res => {
      if (active && res.success) setData(res.data);
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await AnalyticsService.refreshAnalytics();
    if (res.success) setData(res.data);
    setRefreshing(false);
  };

  const handleExport = async () => {
    if (!data) return;
    const csv = await AnalyticsService.exportCSV(data.months);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `analytics_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <SkeletonPage />;

  const lastMonth = data?.months?.[data.months.length - 1] || {};
  const prevMonth = data?.months?.[data.months.length - 2] || {};
  const totalRevenue = data?.months?.reduce((s, m) => s + m.revenue, 0) || 0;
  const totalOrders = data?.months?.reduce((s, m) => s + m.orders, 0) || 0;
  const totalCustomers = data?.months?.[data.months.length - 1]?.customers || 0;

  const revenueChange = prevMonth.revenue ? Math.round((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0;
  const ordersChange = prevMonth.orders ? Math.round((lastMonth.orders - prevMonth.orders) / prevMonth.orders * 100) : 0;

  const chartData = range === 'daily' ? data?.daily : data?.months;

  return (
    <div>
      <SectionHeader title="Analytics & Reports" subtitle="Revenue, sales, customer growth, and performance metrics.">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleRefresh} style={actionBtn} disabled={refreshing}>
            <RefreshCw size={13} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={handleExport} style={{ ...actionBtn, background: 'var(--accent-admin-amber)', color: '#FFF', border: 'none' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </SectionHeader>

      {/* Date Range Tabs */}
      <div style={rangeTabs}>
        {DATE_RANGES.map(r => (
          <button key={r} onClick={() => setRange(r)} style={r === range ? activeRangeTab : rangeTab}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={kpiGrid}>
        <KPICard icon={<TrendingUp size={18} />} label="Total Revenue (12m)" value={`₹${(totalRevenue / 100).toLocaleString()}`} change={revenueChange} changeLabel="vs last month" color="#c27a0a" />
        <KPICard icon={<ShoppingBag size={18} />} label="Total Orders (12m)" value={totalOrders.toLocaleString()} change={ordersChange} changeLabel="vs last month" color="#3b82f6" />
        <KPICard icon={<Users size={18} />} label="Active Customers" value={totalCustomers.toLocaleString()} change={8} changeLabel="new this month" color="#10b981" />
        <KPICard icon={<CreditCard size={18} />} label="Avg Order Value" value={`₹${((lastMonth.avgOrderValue || 0) / 100).toFixed(0)}`} change={4} changeLabel="vs last month" color="#8b5cf6" />
        <KPICard icon={<Percent size={18} />} label="Today's Revenue" value={`₹${((data?.daily?.[data.daily.length - 1]?.revenue || 0) / 100).toFixed(0)}`} change={12} changeLabel="vs yesterday" color="#f97316" />
        <KPICard icon={<Star size={18} />} label="Conversion Rate" value="3.8%" change={0.4} changeLabel="vs last month" color="#ec4899" />
        <KPICard icon={<Package size={18} />} label="Return Rate" value="1.2%" change={-0.3} changeLabel="vs last month" color="#ef4444" />
        <KPICard icon={<ArrowUpRight size={18} />} label="Monthly Growth" value={`${revenueChange > 0 ? '+' : ''}${revenueChange}%`} change={revenueChange} changeLabel="revenue MoM" color="#14b8a6" />
      </div>

      {/* Charts Grid */}
      <div style={chartsGrid}>
        <div style={chartCard}>
          <h3 style={chartTitle}><TrendingUp size={14} /> Revenue Trend</h3>
          <SvgLineChart data={chartData} valueKey="revenue" color="#c27a0a" height={160} />
        </div>
        <div style={chartCard}>
          <h3 style={chartTitle}><ShoppingBag size={14} /> Orders Per Period</h3>
          <SvgBarChart data={chartData} valueKey="orders" color="#3b82f6" height={160} />
        </div>
      </div>

      <div style={chartsGrid}>
        <div style={chartCard}>
          <h3 style={chartTitle}><Users size={14} /> Customer Growth</h3>
          <SvgLineChart data={data?.months} valueKey="customers" color="#10b981" height={140} />
        </div>
        <div style={chartCard}>
          <h3 style={chartTitle}>Category Sales Breakdown</h3>
          <SvgDonutChart data={data?.categoryBreakdown || []} height={140} />
        </div>
      </div>

      {/* Top Products Table */}
      <div style={card}>
        <h3 style={chartTitle}><Package size={14} /> Top Products by Revenue</h3>
        <table style={prodTable}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Product</th>
              <th style={th}>Category</th>
              <th style={{ ...th, textAlign: 'right' }}>Units Sold</th>
              <th style={{ ...th, textAlign: 'right' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(data?.topProducts || []).map((p, i) => (
              <tr key={i}>
                <td style={td}><span style={rankBadge}>{i + 1}</span></td>
                <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                <td style={{ ...td, color: 'var(--text-admin-muted)' }}>{p.category}</td>
                <td style={{ ...td, textAlign: 'right' }}>{p.units}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: 'var(--accent-admin-amber)' }}>₹{(p.revenue / 100).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Returning vs New Customers */}
      <div style={card}>
        <h3 style={chartTitle}><Users size={14} /> Returning vs New Customers (Monthly)</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#c27a0a' }} /> Returning
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6' }} /> New
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {(data?.returningData || []).slice(-6).map((m, i) => {
            const total = m.returning + m.new;
            const retPct = total ? Math.round(m.returning / total * 100) : 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ width: '48px', color: 'var(--text-admin-muted)', flexShrink: 0 }}>{m.month}</span>
                <div style={{ flex: 1, height: '18px', background: 'rgba(253,224,193,0.04)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${retPct}%`, background: '#c27a0a', opacity: 0.8 }} />
                  <div style={{ width: `${100 - retPct}%`, background: '#3b82f6', opacity: 0.6 }} />
                </div>
                <span style={{ width: '36px', color: 'var(--text-admin-muted)', textAlign: 'right' }}>{retPct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: '80px', borderRadius: '10px', background: 'rgba(253,224,193,0.04)' }} />
      ))}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const actionBtn = {
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  background: 'rgba(253,224,193,0.03)', border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)', padding: '0.4rem 0.75rem',
  borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600
};

const rangeTabs = { display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' };
const rangeTab = {
  background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)',
  padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer'
};
const activeRangeTab = {
  background: 'var(--accent-admin-amber)', border: 'none', color: '#FFF',
  padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer'
};

const kpiGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' };
const kpiCard = { background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '12px', padding: '1.1rem' };
const kpiIconBox = { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const changeBadge = { display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '5px' };
const kpiValue = { fontSize: '1.375rem', fontWeight: 'bold', color: 'var(--text-admin-bright)', margin: '0.15rem 0' };
const kpiLabel = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-admin-muted)' };
const kpiSub = { fontSize: '0.65rem', color: 'var(--text-admin-muted)', marginTop: '0.1rem' };

const chartsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' };
const chartCard = { background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '12px', padding: '1.25rem' };
const chartTitle = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-admin-amber)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0 0 1rem 0' };

const card = { background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' };

const prodTable = { width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' };
const th = { padding: '0.4rem 0', borderBottom: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left' };
const td = { padding: '0.65rem 0', borderBottom: '1px dashed rgba(253,224,193,0.04)', color: 'var(--text-admin-bright)' };
const rankBadge = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(194,122,10,0.1)', color: 'var(--accent-admin-amber)', fontWeight: 700, fontSize: '0.75rem' };

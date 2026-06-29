import { useState, useEffect } from 'react';
import { CouponService } from '../../services/CouponService';
import { SectionHeader } from './AdminLayout';
import { Plus, Tag, Check, X, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { z } from 'zod';

// Zod Validation Schema
const couponFormSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric (e.g. WELCOME10)'),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  value: z.number().nonnegative('Value must be a positive number'),
  minOrderAmount: z.number().nonnegative().nullable().optional(),
  maxDiscount: z.number().nonnegative().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true)
}).refine((data) => {
  if (data.type === 'PERCENTAGE' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount value cannot exceed 100%",
  path: ["value"]
});

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Form State
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true
  });

  const fetchCoupons = () => {
    CouponService.getCoupons().then(res => {
      if (res.success) setCoupons(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
  };

  const handleToggleActive = async (coupon) => {
    const res = await CouponService.updateCoupon(coupon.id, { isActive: !coupon.isActive });
    if (res.success) {
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this coupon code permanently?')) {
      const res = await CouponService.deleteCoupon(id);
      if (res.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setGeneralError('');

    // Prepare fields
    const submissionData = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.type === 'FREE_SHIPPING' ? 0 : Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive
    };

    // Zod Validation
    const validationResult = couponFormSchema.safeParse(submissionData);
    if (!validationResult.success) {
      const errorMap = {};
      validationResult.error.errors.forEach(err => {
        errorMap[err.path[0]] = err.message;
      });
      setValidationErrors(errorMap);
      return;
    }

    try {
      // In the database or fallback service, money totals are represented in paise (Paise = Rupees * 100).
      // Let's multiply input regular Rupees to Paise when saving to sync nicely with Prisma model schema!
      const syncPayload = {
        ...submissionData,
        // Convert Rupees fields to Paise
        value: submissionData.type === 'FIXED' ? submissionData.value * 100 : submissionData.value,
        minOrderAmount: submissionData.minOrderAmount ? submissionData.minOrderAmount * 100 : null,
        maxDiscount: submissionData.maxDiscount ? submissionData.maxDiscount * 100 : null,
      };

      const res = await CouponService.createCoupon(syncPayload);
      if (res.success) {
        setShowAddForm(false);
        setForm({
          code: '',
          type: 'PERCENTAGE',
          value: '',
          minOrderAmount: '',
          maxDiscount: '',
          usageLimit: '',
          expiresAt: '',
          isActive: true
        });
        fetchCoupons();
      }
    } catch (err) {
      setGeneralError(err.message || 'An error occurred during coupon creation.');
    }
  };

  return (
    <div>
      <SectionHeader title="Promo Coupons" subtitle="Manage store discount codes, active states, and usage parameters.">
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="admin-navbar__btn admin-navbar__btn--quickadd">
            <Plus size={16} /> Create Coupon
          </button>
        )}
      </SectionHeader>

      {generalError && (
        <div style={errorBanner}>
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      <div style={layoutGrid}>
        {/* Left: Coupons Index list */}
        <div className="recent-orders-card" style={{ flexGrow: 2, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem' }}>Loading coupon ledger...</div>
          ) : coupons.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Uses Count</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>
                        <code style={codeText}><Tag size={12} style={{ marginRight: '0.25rem' }} /> {c.code}</code>
                      </td>
                      <td>
                        <span style={c.type === 'PERCENTAGE' ? pctBadge : c.type === 'FIXED' ? fixedBadge : shipBadge}>
                          {c.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {c.type === 'PERCENTAGE' ? `${c.value}%` : c.type === 'FIXED' ? `₹${(c.value / 100).toFixed(0)}` : '—'}
                      </td>
                      <td>{c.minOrderAmount ? `₹${(c.minOrderAmount / 100).toFixed(0)}` : 'No Minimum'}</td>
                      <td>
                        {c.usageCount} / {c.usageLimit || '∞'}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: isExpired ? '#d32f2f' : 'var(--text-admin-muted)' }}>
                        {c.expiresAt ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {new Date(c.expiresAt).toLocaleDateString()}
                          </span>
                        ) : 'Never'}
                      </td>
                      <td>
                        <span className={`status-badge status-badge--${c.isActive && !isExpired ? 'delivered' : 'cancelled'}`}>
                          {isExpired ? 'Expired' : (c.isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td>
                        <div style={actionsRow}>
                          <button
                            onClick={() => handleToggleActive(c)}
                            style={iconAction}
                            title={c.isActive ? 'Deactivate code' : 'Activate code'}
                            disabled={isExpired}
                          >
                            {c.isActive ? <X size={14} color="#d32f2f" /> : <Check size={14} color="#2e7d32" />}
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            style={{ ...iconAction, color: '#d32f2f' }}
                            title="Delete coupon"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-admin-muted)' }}>
              No coupon codes configured yet.
            </div>
          )}
        </div>

        {/* Right: Create Form Inline */}
        {showAddForm && (
          <div style={{ minWidth: '320px', flexGrow: 1 }}>
            <form onSubmit={handleSubmit} style={formCard}>
              <div style={formHeader}>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Create Promo Coupon</h3>
                <button type="button" onClick={() => { setShowAddForm(false); setValidationErrors({}); }} style={closeBtn}>✕</button>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Coupon Code *</label>
                <input
                  type="text"
                  placeholder="WELCOME10"
                  style={validationErrors.code ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.code}
                  onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                />
                {validationErrors.code && <span style={errorMsg}>{validationErrors.code}</span>}
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Discount Type *</label>
                <select style={selectStyle} value={form.type} onChange={set('type')}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>

              {form.type !== 'FREE_SHIPPING' && (
                <div style={inputGroup}>
                  <label style={labelStyle}>
                    {form.type === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    placeholder={form.type === 'PERCENTAGE' ? '10' : '150'}
                    style={validationErrors.value ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                    value={form.value}
                    onChange={set('value')}
                  />
                  {validationErrors.value && <span style={errorMsg}>{validationErrors.value}</span>}
                </div>
              )}

              <div style={inputGroup}>
                <label style={labelStyle}>Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  placeholder="499"
                  style={inputStyle}
                  value={form.minOrderAmount}
                  onChange={set('minOrderAmount')}
                />
              </div>

              {form.type === 'PERCENTAGE' && (
                <div style={inputGroup}>
                  <label style={labelStyle}>Maximum Discount Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="100"
                    style={inputStyle}
                    value={form.maxDiscount}
                    onChange={set('maxDiscount')}
                  />
                </div>
              )}

              <div style={inputGroup}>
                <label style={labelStyle}>Expiry Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={form.expiresAt}
                  onChange={set('expiresAt')}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Total Usage Limit</label>
                <input
                  type="number"
                  placeholder="500"
                  style={inputStyle}
                  value={form.usageLimit}
                  onChange={set('usageLimit')}
                />
              </div>

              <button type="submit" style={submitBtn}>
                Create Coupon Code
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const codeText = {
  fontSize: '0.75rem',
  color: 'var(--accent-admin-amber)',
  background: 'rgba(194, 122, 10, 0.05)',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  width: 'fit-content'
};

const pctBadge = {
  fontSize: '0.65rem',
  fontWeight: 'bold',
  background: 'rgba(46, 125, 50, 0.08)',
  color: '#2e7d32',
  padding: '0.15rem 0.35rem',
  borderRadius: '4px'
};

const fixedBadge = {
  fontSize: '0.65rem',
  fontWeight: 'bold',
  background: 'rgba(194, 122, 10, 0.08)',
  color: 'var(--accent-admin-amber)',
  padding: '0.15rem 0.35rem',
  borderRadius: '4px'
};

const shipBadge = {
  fontSize: '0.65rem',
  fontWeight: 'bold',
  background: 'rgba(43, 108, 176, 0.08)',
  color: '#2b6cb0',
  padding: '0.15rem 0.35rem',
  borderRadius: '4px'
};

const layoutGrid = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'start',
  flexWrap: 'wrap'
};

const actionsRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.25rem'
};

const iconAction = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const formCard = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
};

const formHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '1rem',
  borderBottom: '1px solid var(--border-admin)',
  paddingBottom: '0.5rem'
};

const closeBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  cursor: 'pointer'
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  marginBottom: '0.9rem'
};

const labelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 600
};

const inputStyle = {
  padding: '0.45rem 0.75rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%'
};

const selectStyle = {
  padding: '0.45rem 0.75rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  cursor: 'pointer',
  width: '100%'
};

const submitBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  width: '100%',
  padding: '0.55rem',
  borderRadius: '6px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '0.5rem',
  transition: 'background 0.2s ease'
};

const errorBanner = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  background: 'rgba(211,47,47,0.1)',
  border: '1px solid #d32f2f',
  color: '#d32f2f',
  borderRadius: '12px',
  padding: '1rem',
  marginBottom: '1.5rem',
  fontSize: '0.875rem'
};

const errorMsg = {
  fontSize: '0.7rem',
  color: '#d32f2f',
  fontWeight: 500,
  marginTop: '0.1rem'
};

import { useState } from 'react';
import { Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';

const WEIGHT_OPTIONS = ['50g', '100g', '250g', '500g', '1kg', 'Standard'];

export default function VariantManager({ variants = [], onChange }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    weight: '250g',
    price: '',
    salePrice: '',
    sku: '',
    stock: '',
  });

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');

    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      setError('Price must be a positive number');
      return;
    }
    if (!form.sku.trim()) {
      setError('SKU is required');
      return;
    }
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) {
      setError('Stock must be a non-negative integer');
      return;
    }

    // Check duplicate weight
    const isDuplicateWeight = variants.some(v => v.weight.toLowerCase() === form.weight.toLowerCase());
    if (isDuplicateWeight) {
      setError(`A variant for ${form.weight} already exists`);
      return;
    }

    // Check duplicate SKU
    const isDuplicateSku = variants.some(v => v.sku.toLowerCase() === form.sku.trim().toLowerCase());
    if (isDuplicateSku) {
      setError(`A variant with SKU ${form.sku.trim()} already exists`);
      return;
    }

    const newVariant = {
      weight: form.weight,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      sku: form.sku.trim(),
      stock: Number(form.stock),
    };

    onChange([...variants, newVariant]);
    setShowAddForm(false);
    setForm({
      weight: '250g',
      price: '',
      salePrice: '',
      sku: '',
      stock: '',
    });
  };

  const handleDelete = (indexToDelete) => {
    const updated = variants.filter((_, idx) => idx !== indexToDelete);
    onChange(updated);
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <label style={labelStyles}>Product Variants</label>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            style={addBtnStyles}
          >
            <Plus size={14} /> Add Variant
          </button>
        )}
      </div>

      {/* Add Variant Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} style={formCardStyles}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600 }}>Create New Variant</h4>
          
          {error && (
            <div style={errorBanner}>
              <AlertCircle size={14} /> <span>{error}</span>
            </div>
          )}

          <div style={formRow}>
            <div style={formGroup}>
              <label style={inputLabel}>Weight</label>
              <select style={inputStyle} value={form.weight} onChange={set('weight')}>
                {WEIGHT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div style={formGroup}>
              <label style={inputLabel}>SKU *</label>
              <input
                type="text"
                placeholder="STB-COF-01-250G"
                style={inputStyle}
                value={form.sku}
                onChange={set('sku')}
              />
            </div>

            <div style={formGroup}>
              <label style={inputLabel}>Price (₹) *</label>
              <input
                type="number"
                placeholder="499"
                style={inputStyle}
                value={form.price}
                onChange={set('price')}
              />
            </div>
          </div>

          <div style={formRow}>
            <div style={formGroup}>
              <label style={inputLabel}>Sale Price (₹)</label>
              <input
                type="number"
                placeholder="449"
                style={inputStyle}
                value={form.salePrice}
                onChange={set('salePrice')}
              />
            </div>

            <div style={formGroup}>
              <label style={inputLabel}>Stock Quantity *</label>
              <input
                type="number"
                placeholder="50"
                style={inputStyle}
                value={form.stock}
                onChange={set('stock')}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setError(''); }}
              style={cancelBtn}
            >
              <X size={14} /> Cancel
            </button>
            <button type="submit" style={saveBtn}>
              <Check size={14} /> Save Variant
            </button>
          </div>
        </form>
      )}

      {/* Variants Table List */}
      {variants.length > 0 ? (
        <div style={tableWrapper}>
          <table className="admin-table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th style={thStyle}>Weight</th>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Sale Price</th>
                <th style={thStyle}>Stock</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => (
                <tr key={idx}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{v.weight}</td>
                  <td style={tdStyle}>{v.sku}</td>
                  <td style={tdStyle}>₹{v.price}</td>
                  <td style={tdStyle}>{v.salePrice ? `₹${v.salePrice}` : '—'}</td>
                  <td style={tdStyle}>{v.stock}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button
                      type="button"
                      style={deleteBtn}
                      onClick={() => handleDelete(idx)}
                      title="Remove Variant"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={emptyState}>
          <span>No variants configured. The product will utilize default catalog price and weight.</span>
        </div>
      )}
    </div>
  );
}

const containerStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '100%'
};

const headerStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const labelStyles = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-admin-bright)'
};

const addBtnStyles = {
  background: 'none',
  border: '1px solid var(--accent-admin-amber)',
  color: 'var(--accent-admin-amber)',
  borderRadius: '6px',
  padding: '0.35rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  transition: 'all 0.2s ease'
};

const formCardStyles = {
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const errorBanner = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'rgba(211,47,47,0.1)',
  border: '1px solid #d32f2f',
  color: '#d32f2f',
  fontSize: '0.75rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px'
};

const formRow = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem'
};

const formGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const inputLabel = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 500
};

const inputStyle = {
  padding: '0.4rem 0.75rem',
  background: 'rgba(253,224,193,0.04)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none'
};

const cancelBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.4rem 0.875rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem'
};

const saveBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  padding: '0.4rem 0.875rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem'
};

const tableWrapper = {
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  overflow: 'hidden'
};

const thStyle = {
  padding: '0.5rem 0.75rem',
  background: 'rgba(253,224,193,0.02)',
  borderBottom: '1px solid var(--border-admin)'
};

const tdStyle = {
  padding: '0.6rem 0.75rem',
  borderBottom: '1px solid rgba(253,224,193,0.02)'
};

const deleteBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '4px'
};

const emptyState = {
  padding: '1rem',
  border: '1px dashed var(--border-admin)',
  borderRadius: '8px',
  textAlign: 'center',
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)'
};

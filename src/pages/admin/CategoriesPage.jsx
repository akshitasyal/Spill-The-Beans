import { useState, useEffect } from 'react';
import { CategoryService } from '../../services/CategoryService';
import { SectionHeader } from './AdminLayout';
import { Edit3, Trash2, X, Check, Folder, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(3, 'Category Name must be at least 3 characters'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be alphanumeric with hyphens (e.g. instant-coffee)'),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  image: z.string().optional()
});

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  
  // Editor State
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    image: ''
  });

  const fetchCategories = () => {
    CategoryService.getCategories().then(res => {
      if (res.success) setCategories(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm(f => {
      const update = { ...f, [field]: val };
      if (field === 'name' && !editId) {
        update.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
      return update;
    });
  };

  const handleEditClick = (c) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      parentId: c.parentId || '',
      image: c.image || ''
    });
    setValidationErrors({});
    setGeneralError('');
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ name: '', slug: '', description: '', parentId: '', image: '' });
    setValidationErrors({});
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setGeneralError('');

    const submission = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      parentId: form.parentId || null,
      image: form.image
    };

    // Zod validation
    const result = categorySchema.safeParse(submission);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    try {
      if (editId) {
        // Prevent nesting category under itself
        if (submission.parentId === editId) {
          setValidationErrors({ parentId: 'Cannot nest a category under itself.' });
          return;
        }

        const res = await CategoryService.updateCategory(editId, submission);
        if (res.success) {
          fetchCategories();
          handleCancel();
        }
      } else {
        const res = await CategoryService.createCategory(submission);
        if (res.success) {
          fetchCategories();
          handleCancel();
        }
      }
    } catch (err) {
      setGeneralError(err.message || 'An error occurred during category save.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category? Products in this category will lose their reference.')) {
      try {
        const res = await CategoryService.deleteCategory(id);
        if (res.success) {
          fetchCategories();
        }
      } catch (err) {
        alert(err.message || 'Could not delete category');
      }
    }
  };

  return (
    <div>
      <SectionHeader title="Categories" subtitle="Organize Spill The Beans products in hierarchical collections." />

      {generalError && (
        <div style={errorBanner}>
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      <div style={layoutGrid}>
        {/* Left Side: Category Table */}
        <div className="recent-orders-card" style={{ flexGrow: 2, overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.0625rem', fontWeight: 600 }}>Active Product Collections</h3>
          {loading ? (
            <div style={{ padding: '2rem 1rem' }}>Loading category index...</div>
          ) : categories.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Hierarchy Path</th>
                  <th>Products Count</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} style={editId === c.id ? editingRow : undefined}>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Folder size={16} color="var(--accent-admin-amber)" />
                      {c.name}
                    </td>
                    <td><code style={slugCode}>{c.slug}</code></td>
                    <td style={{ color: 'var(--text-admin-muted)' }}>
                      {c.parent ? `${c.parent.name} → ${c.name}` : 'Root'}
                    </td>
                    <td>{c.productCount}</td>
                    <td>
                      <div style={actionsRow}>
                        <button onClick={() => handleEditClick(c)} style={iconAction} title="Edit Category Details">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} style={{ ...iconAction, color: '#d32f2f' }} title="Delete Category">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-admin-muted)' }}>
              No categories populated. Use the form on the right to build one.
            </div>
          )}
        </div>

        {/* Right Side: Form (Create or Edit) */}
        <div style={{ minWidth: '320px', flexGrow: 1 }}>
          <form onSubmit={handleSubmit} style={formCard}>
            <h3 style={cardTitle}>{editId ? 'Modify Category' : 'Create Category'}</h3>

            <div style={inputGroup}>
              <label style={labelStyle}>Category Name *</label>
              <input
                type="text"
                placeholder="French Press"
                style={validationErrors.name ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                value={form.name}
                onChange={set('name')}
              />
              {validationErrors.name && <span style={errorMsg}>{validationErrors.name}</span>}
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Slug *</label>
              <input
                type="text"
                placeholder="french-press"
                style={validationErrors.slug ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                value={form.slug}
                onChange={set('slug')}
              />
              {validationErrors.slug && <span style={errorMsg}>{validationErrors.slug}</span>}
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Parent Category <span style={{ color: 'var(--text-admin-muted)' }}>(Optional)</span></label>
              <select
                style={selectStyle}
                value={form.parentId}
                onChange={set('parentId')}
              >
                <option value="">None (Root Category)</option>
                {/* Filter out children categories to keep nesting depth to 2 levels */}
                {categories.filter(c => !c.parentId && c.id !== editId).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {validationErrors.parentId && <span style={errorMsg}>{validationErrors.parentId}</span>}
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Image URL <span style={{ color: 'var(--text-admin-muted)' }}>(Optional)</span></label>
              <input
                type="text"
                placeholder="/assets/accessory_tumbler.png"
                style={inputStyle}
                value={form.image}
                onChange={set('image')}
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Description</label>
              <textarea
                rows={3}
                placeholder="Collection brief description..."
                style={textareaStyle}
                value={form.description}
                onChange={set('description')}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {editId && (
                <button type="button" onClick={handleCancel} style={cancelBtn}>
                  <X size={14} /> Cancel
                </button>
              )}
              <button type="submit" style={submitBtn}>
                <Check size={14} /> {editId ? 'Save Changes' : 'Create Collection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Styling definitions
const layoutGrid = {
  display: 'flex',
  gap: '2rem',
  alignItems: 'start',
  flexWrap: 'wrap'
};

const slugCode = {
  fontSize: '0.75rem',
  color: 'var(--accent-admin-amber)',
  background: 'rgba(194, 122, 10, 0.05)',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px'
};

const editingRow = {
  background: 'rgba(194, 122, 10, 0.03)',
  borderColor: 'var(--accent-admin-amber)'
};

const actionsRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.5rem'
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
  padding: '1.5rem',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
};

const cardTitle = {
  fontSize: '1rem',
  fontWeight: 600,
  margin: '0 0 1.25rem 0',
  color: 'var(--text-admin-bright)',
  borderBottom: '1px solid var(--border-admin)',
  paddingBottom: '0.5rem'
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  marginBottom: '1.25rem'
};

const labelStyle = {
  fontSize: '0.8125rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 600
};

const inputStyle = {
  padding: '0.6rem 0.875rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%'
};

const selectStyle = {
  padding: '0.6rem 0.875rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.875rem',
  outline: 'none',
  cursor: 'pointer',
  width: '100%'
};

const textareaStyle = {
  padding: '0.6rem 0.875rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical',
  boxSizing: 'border-box',
  width: '100%'
};

const cancelBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.6rem 1rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem'
};

const submitBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  flexGrow: 1,
  padding: '0.6rem 1rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
  transition: 'background 0.2s ease'
};

const errorMsg = {
  fontSize: '0.75rem',
  color: '#d32f2f',
  fontWeight: 500,
  marginTop: '0.15rem'
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

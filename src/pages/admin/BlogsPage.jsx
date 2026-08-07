import { useState, useEffect } from 'react';
import { BlogService } from '../../services/BlogService';
import { SectionHeader } from './AdminLayout';
import { Plus, Edit3, Trash2, X, Check, FileText, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be alphanumeric with hyphens (e.g. protein-coffee-recipe)'),
  excerpt: z.string().min(1, 'Excerpt summary is required'),
  content: z.string().min(1, 'Content body is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().optional()
});

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Editor State
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Recipes',
    tagsRaw: '',
    image: '',
    isActive: true
  });

  const fetchBlogs = () => {
    BlogService.getBlogs().then(res => {
      if (res.success) setBlogs(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => {
      const update = { ...f, [field]: val };
      if (field === 'title' && !editId) {
        update.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
      return update;
    });
  };

  const handleEditClick = (b) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content || '',
      category: b.category,
      tagsRaw: (b.tags || []).join(', '),
      image: b.image || '',
      isActive: b.isActive
    });
    setShowForm(true);
    setValidationErrors({});
    setGeneralError('');
    // Scroll to top so the side-by-side form panel is immediately visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditId(null);
    setShowForm(false);
    setForm({ title: '', slug: '', excerpt: '', content: '', category: 'Recipes', tagsRaw: '', image: '', isActive: true });
    setValidationErrors({});
    setGeneralError('');
  };

  const handleToggleActive = async (blog) => {
    const res = await BlogService.updateBlog(blog.id, { isActive: !blog.isActive });
    if (res.success) {
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, isActive: !blog.isActive } : b));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this blog post permanently?')) {
      const res = await BlogService.deleteBlog(id);
      if (res.success) {
        fetchBlogs();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setGeneralError('');

    const submission = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      image: form.image
    };

    // Zod validation
    const result = blogSchema.safeParse(submission);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    const payload = {
      ...submission,
      tags: form.tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
      isActive: form.isActive
    };

    try {
      if (editId) {
        const res = await BlogService.updateBlog(editId, payload);
        if (res.success) {
          fetchBlogs();
          handleCancel();
        }
      } else {
        const res = await BlogService.createBlog(payload);
        if (res.success) {
          fetchBlogs();
          handleCancel();
        }
      }
    } catch (err) {
      setGeneralError(err.message || 'An error occurred during blog save.');
    }
  };

  return (
    <div>
      <SectionHeader title="Blog Editor" subtitle="Publish recipes, lifestyle articles, and single-origin updates.">
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="admin-navbar__btn admin-navbar__btn--quickadd">
            <Plus size={16} /> Write Article
          </button>
        )}
      </SectionHeader>

      {generalError && (
        <div style={errorBanner}>
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: showForm ? 'minmax(0, 1fr) 380px' : '1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left: Articles index table */}
        <div className="recent-orders-card" style={{ minWidth: 0, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem' }}>Loading blog catalog...</div>
          ) : blogs.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Read Time</th>
                  <th>Date Created</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={14} color="var(--accent-admin-amber)" />
                      {b.title}
                    </td>
                    <td><code style={slugCode}>{b.slug}</code></td>
                    <td>{b.category}</td>
                    <td>{b.readTime}</td>
                    <td style={{ color: 'var(--text-admin-muted)', fontSize: '0.75rem' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${b.isActive ? 'delivered' : 'cancelled'}`}>
                        {b.isActive ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div style={actionsRow}>
                        <button onClick={() => handleToggleActive(b)} style={iconAction} title={b.isActive ? 'Draft post' : 'Publish post'}>
                          {b.isActive ? <X size={14} color="#d32f2f" /> : <Check size={14} color="#2e7d32" />}
                        </button>
                        <button onClick={() => handleEditClick(b)} style={iconAction} title="Edit Post Details">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(b.id)} style={{ ...iconAction, color: '#d32f2f' }} title="Delete Article">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-admin-muted)' }}>
              No blog articles written yet.
            </div>
          )}
        </div>

        {/* Right: Article creator panel */}
        {showForm && (
          <div>
            <form onSubmit={handleSubmit} style={formCard}>
              <div style={formHeader}>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
                  {editId ? 'Modify Article' : 'Write Post'}
                </h3>
                <button type="button" onClick={handleCancel} style={closeBtn}>✕</button>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Article Title *</label>
                <input
                  type="text"
                  placeholder="How to Brew French Press Right"
                  style={validationErrors.title ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.title}
                  onChange={set('title')}
                />
                {validationErrors.title && <span style={errorMsg}>{validationErrors.title}</span>}
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Slug *</label>
                <input
                  type="text"
                  placeholder="how-to-brew-french-press"
                  style={validationErrors.slug ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.slug}
                  onChange={set('slug')}
                />
                {validationErrors.slug && <span style={errorMsg}>{validationErrors.slug}</span>}
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Category *</label>
                <select style={selectStyle} value={form.category} onChange={set('category')}>
                  <option value="Recipes">Recipes</option>
                  <option value="Guides">Guides</option>
                  <option value="Tips">Tips</option>
                  <option value="Origins">Origins</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Tags <span style={{ color: 'var(--text-admin-muted)' }}>(comma separated)</span></label>
                <input
                  type="text"
                  placeholder="Brewing, Espresso, Tips"
                  style={inputStyle}
                  value={form.tagsRaw}
                  onChange={set('tagsRaw')}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Featured Image URL</label>
                <input
                  type="text"
                  placeholder="/assets/accessory_milk_frother.png"
                  style={inputStyle}
                  value={form.image}
                  onChange={set('image')}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Excerpt Summary *</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary shown on blog feed lists..."
                  style={validationErrors.excerpt ? { ...textareaStyle, borderColor: '#d32f2f' } : textareaStyle}
                  value={form.excerpt}
                  onChange={set('excerpt')}
                />
                {validationErrors.excerpt && <span style={errorMsg}>{validationErrors.excerpt}</span>}
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Content Body *</label>
                <textarea
                  rows={6}
                  placeholder="Write the full post markdown content here..."
                  style={validationErrors.content ? { ...textareaStyle, borderColor: '#d32f2f' } : textareaStyle}
                  value={form.content}
                  onChange={set('content')}
                />
                {validationErrors.content && <span style={errorMsg}>{validationErrors.content}</span>}
              </div>

              <div style={inputGroup}>
                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={set('isActive')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Publish Post Immediately
                </label>
              </div>

              <button type="submit" style={submitBtn}>
                {editId ? 'Save Changes' : 'Publish Article'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const slugCode = {
  fontSize: '0.75rem',
  color: 'var(--accent-admin-amber)',
  background: 'rgba(194, 122, 10, 0.05)',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px'
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

const textareaStyle = {
  padding: '0.45rem 0.75rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical',
  boxSizing: 'border-box',
  width: '100%'
};

const checkboxLabel = {
  fontSize: '0.8125rem',
  color: 'var(--text-admin-bright)',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer'
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

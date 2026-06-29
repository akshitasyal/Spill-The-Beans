import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { ProductService } from '../../services/ProductService';
import { CategoryService } from '../../services/CategoryService';
import { SectionHeader } from './AdminLayout';
import ProductImageUploader from '../../components/admin/ProductImageUploader';
import VariantManager from '../../components/admin/VariantManager';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

// Zod Validation Schema
const productFormSchema = z.object({
  name: z.string().min(3, 'Product Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be alphanumeric with hyphens (e.g. delicious-mocha)'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Regular Price must be a positive number'),
  salePrice: z.number().positive('Sale Price must be positive').nullable().optional(),
  stock: z.number().int().nonnegative('Stock count must be a non-negative integer'),
  weight: z.string().optional(),
  roast: z.string().optional(),
  origin: z.string().optional(),
  process: z.string().optional(),
  flavourNotes: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  variants: z.array(z.object({
    weight: z.string(),
    price: z.number().positive(),
    salePrice: z.number().positive().nullable(),
    sku: z.string(),
    stock: z.number().int().nonnegative()
  })).optional(),
}).refine((data) => {
  if (data.salePrice && data.salePrice >= data.price) {
    return false;
  }
  return true;
}, {
  message: "Sale Price must be less than the regular price",
  path: ["salePrice"]
});

const ROAST_LEVELS = ['Light', 'Medium', 'Medium-Dark', 'Dark', 'Extra Dark', 'N/A'];

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    brand: 'Spill The Beans',
    sku: '',
    price: '',
    salePrice: '',
    stock: '',
    weight: '100g',
    roast: 'Medium',
    origin: 'Araku Valley',
    process: 'Washed',
    flavourNotesRaw: '',
    highlightsRaw: '',
    isActive: true,
    isFeatured: false,
    images: [],
    variants: []
  });

  // Fetch categories & product if editing
  useEffect(() => {
    CategoryService.getCategories().then(res => {
      if (res.success) {
        setCategories(res.data);
        if (res.data.length > 0 && !isEdit) {
          setForm(f => ({ ...f, categoryId: res.data[0].id }));
        }
      }
    });

    if (isEdit) {
      ProductService.getProduct(id)
        .then(prod => {
          setForm({
            name: prod.name || '',
            slug: prod.slug || '',
            shortDescription: prod.shortDescription || '',
            description: prod.description || '',
            categoryId: prod.categoryId || '',
            brand: prod.brand || 'Spill The Beans',
            sku: prod.sku || '',
            price: prod.price || '',
            salePrice: prod.salePrice || '',
            stock: prod.stock !== undefined ? prod.stock : '',
            weight: prod.weight || '100g',
            roast: prod.roast || 'Medium',
            origin: prod.origin || 'Araku Valley',
            process: prod.process || 'Washed',
            flavourNotesRaw: (prod.flavourNotes || []).join(', '),
            highlightsRaw: (prod.highlights || []).join(', '),
            isActive: prod.isActive !== undefined ? prod.isActive : true,
            isFeatured: prod.isFeatured !== undefined ? prod.isFeatured : false,
            images: prod.images || [],
            variants: prod.variants || []
          });
          setLoading(false);
        })
        .catch(() => {
          setGeneralError('Product not found or database sync unavailable.');
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => {
      const update = { ...f, [field]: val };
      // Generate slug automatically from name if creating
      if (field === 'name' && !isEdit) {
        update.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
      return update;
    });
  };

  const handleImagesChange = (newImages) => {
    setForm(f => ({ ...f, images: newImages }));
  };

  const handleVariantsChange = (newVariants) => {
    setForm(f => ({ ...f, variants: newVariants }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setGeneralError('');
    setSaving(true);

    // Prepare fields
    const submissionData = {
      name: form.name,
      slug: form.slug,
      shortDescription: form.shortDescription,
      description: form.description,
      categoryId: form.categoryId,
      brand: form.brand,
      sku: form.sku,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
      weight: form.weight,
      roast: form.roast,
      origin: form.origin,
      process: form.process,
      flavourNotes: form.flavourNotesRaw.split(',').map(s => s.trim()).filter(Boolean),
      highlights: form.highlightsRaw.split(',').map(s => s.trim()).filter(Boolean),
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      images: form.images,
      variants: form.variants
    };

    // Zod Validation
    const validationResult = productFormSchema.safeParse(submissionData);
    if (!validationResult.success) {
      const errorMap = {};
      validationResult.error.errors.forEach(err => {
        errorMap[err.path[0]] = err.message;
      });
      setValidationErrors(errorMap);
      setSaving(false);
      return;
    }

    if (form.images.length === 0) {
      setValidationErrors(prev => ({ ...prev, images: 'Upload at least one product image' }));
      setSaving(false);
      return;
    }

    try {
      if (isEdit) {
        const res = await ProductService.updateProduct(id, submissionData);
        if (res.success) {
          navigate('/admin/products');
        }
      } else {
        const res = await ProductService.createProduct(submissionData);
        if (res.success) {
          navigate('/admin/products');
        }
      }
    } catch (err) {
      setGeneralError(err.message || 'An error occurred during save operations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-admin-bright)' }}>Loading product editor...</div>;
  }

  return (
    <div>
      <SectionHeader
        title={isEdit ? 'Edit Product' : 'Add New Product'}
        subtitle={isEdit ? `Edit details for SKU: ${form.sku}` : 'Add a new coffee blend or accessory to the catalog.'}
      >
        <Link to="/admin/products" style={backBtn}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </SectionHeader>

      {generalError && (
        <div style={errorBanner}>
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={formGrid}>
        {/* Left main forms panel */}
        <div style={leftPanel}>
          <div style={formCard}>
            <h3 style={cardTitle}>Basic Information</h3>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Product Name *</label>
              <input
                type="text"
                placeholder="Mocha pe Chauka Instant Coffee Jars"
                style={validationErrors.name ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                value={form.name}
                onChange={set('name')}
              />
              {validationErrors.name && <span style={errorMsg}>{validationErrors.name}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mobile-stacked">
              <div style={inputGroup}>
                <label style={labelStyle}>Slug *</label>
                <input
                  type="text"
                  placeholder="mocha-pe-chauka"
                  style={validationErrors.slug ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.slug}
                  onChange={set('slug')}
                />
                {validationErrors.slug && <span style={errorMsg}>{validationErrors.slug}</span>}
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Brand Name *</label>
                <input
                  type="text"
                  style={validationErrors.brand ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.brand}
                  onChange={set('brand')}
                />
                {validationErrors.brand && <span style={errorMsg}>{validationErrors.brand}</span>}
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Short Description *</label>
              <input
                type="text"
                placeholder="A sweet cocoa-flavored soluble Arabica roast..."
                style={validationErrors.shortDescription ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                value={form.shortDescription}
                onChange={set('shortDescription')}
              />
              {validationErrors.shortDescription && <span style={errorMsg}>{validationErrors.shortDescription}</span>}
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Full Description</label>
              <textarea
                rows={5}
                placeholder="Describe your coffee origins, tasting notes, highlights..."
                style={textareaStyle}
                value={form.description}
                onChange={set('description')}
              />
            </div>
          </div>

          {/* Pricing & Stock card */}
          <div style={formCard}>
            <h3 style={cardTitle}>Pricing & Stock Control</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }} className="mobile-stacked">
              <div style={inputGroup}>
                <label style={labelStyle}>SKU *</label>
                <input
                  type="text"
                  placeholder="STB-COF-01"
                  style={validationErrors.sku ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.sku}
                  onChange={set('sku')}
                />
                {validationErrors.sku && <span style={errorMsg}>{validationErrors.sku}</span>}
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Regular Price (₹) *</label>
                <input
                  type="number"
                  placeholder="349"
                  style={validationErrors.price ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.price}
                  onChange={set('price')}
                />
                {validationErrors.price && <span style={errorMsg}>{validationErrors.price}</span>}
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Sale Price (₹)</label>
                <input
                  type="number"
                  placeholder="299"
                  style={validationErrors.salePrice ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.salePrice}
                  onChange={set('salePrice')}
                />
                {validationErrors.salePrice && <span style={errorMsg}>{validationErrors.salePrice}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="mobile-stacked">
              <div style={inputGroup}>
                <label style={labelStyle}>Total Stock *</label>
                <input
                  type="number"
                  placeholder="100"
                  style={validationErrors.stock ? { ...inputStyle, borderColor: '#d32f2f' } : inputStyle}
                  value={form.stock}
                  onChange={set('stock')}
                />
                {validationErrors.stock && <span style={errorMsg}>{validationErrors.stock}</span>}
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Net Weight (e.g. 100g, 250g)</label>
                <input
                  type="text"
                  placeholder="100g"
                  style={inputStyle}
                  value={form.weight}
                  onChange={set('weight')}
                />
              </div>
            </div>
          </div>

          {/* Variants section */}
          <div style={formCard}>
            <VariantManager
              variants={form.variants}
              onChange={handleVariantsChange}
            />
          </div>
        </div>

        {/* Right side settings panel */}
        <div style={rightPanel}>
          <div style={formCard}>
            <h3 style={cardTitle}>Organization</h3>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Category *</label>
              <select
                style={selectStyle}
                value={form.categoryId}
                onChange={set('categoryId')}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent ? `${c.parent.name} → ` : ''}{c.name}
                  </option>
                ))}
              </select>
              {validationErrors.categoryId && <span style={errorMsg}>{validationErrors.categoryId}</span>}
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Roast Level</label>
              <select style={selectStyle} value={form.roast} onChange={set('roast')}>
                {ROAST_LEVELS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={inputGroup}>
                <label style={labelStyle}>Origin</label>
                <input type="text" style={inputStyle} value={form.origin} onChange={set('origin')} />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Process</label>
                <input type="text" style={inputStyle} value={form.process} onChange={set('process')} />
              </div>
            </div>
          </div>

          {/* Product Media Uploader */}
          <div style={formCard}>
            <ProductImageUploader
              images={form.images}
              onChange={handleImagesChange}
            />
            {validationErrors.images && <span style={errorMsg}>{validationErrors.images}</span>}
          </div>

          {/* Spec tags */}
          <div style={formCard}>
            <h3 style={cardTitle}>Product Specifications</h3>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Flavour Notes <span style={{ color: 'var(--text-admin-muted)' }}>(comma separated)</span></label>
              <input
                type="text"
                placeholder="Chocolate, Roasted Walnuts, Honey"
                style={inputStyle}
                value={form.flavourNotesRaw}
                onChange={set('flavourNotesRaw')}
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Product Highlights <span style={{ color: 'var(--text-admin-muted)' }}>(comma separated)</span></label>
              <input
                type="text"
                placeholder="100% Premium Arabica, No Added Sugar, Vegan"
                style={inputStyle}
                value={form.highlightsRaw}
                onChange={set('highlightsRaw')}
              />
            </div>

            {/* Checkbox settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={set('isActive')}
                  style={{ marginRight: '0.5rem' }}
                />
                Product Catalog Active (Visible to Shop)
              </label>

              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={set('isFeatured')}
                  style={{ marginRight: '0.5rem' }}
                />
                Feature on Homepage Carousel
              </label>
            </div>
          </div>

          {/* Form Actions Submit */}
          <button
            type="submit"
            disabled={saving}
            style={submitBtn}
          >
            <Save size={16} /> {saving ? 'Saving changes...' : 'Save Product'}
          </button>
        </div>
      </form>

      <style>{`
        @media (max-width: 900px) {
          .mobile-stacked {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Styling classes
const backBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  borderRadius: '8px',
  padding: '0.45rem 1rem',
  fontSize: '0.8125rem',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
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

const formGrid = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '2rem',
  alignItems: 'start'
};

const leftPanel = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem'
};

const rightPanel = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem'
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
  marginBottom: '1.25rem',
  width: '100%'
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
  width: '100%',
  boxSizing: 'border-box'
};

const selectStyle = {
  padding: '0.6rem 0.875rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  cursor: 'pointer'
};

const textareaStyle = {
  padding: '0.6rem 0.875rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
  resize: 'vertical',
  boxSizing: 'border-box'
};

const checkboxLabel = {
  fontSize: '0.875rem',
  color: 'var(--text-admin-bright)',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none'
};

const submitBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  width: '100%',
  padding: '0.875rem',
  borderRadius: '8px',
  fontSize: '0.9375rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  transition: 'background 0.2s ease'
};

const errorMsg = {
  fontSize: '0.75rem',
  color: '#d32f2f',
  fontWeight: 500,
  marginTop: '0.15rem'
};

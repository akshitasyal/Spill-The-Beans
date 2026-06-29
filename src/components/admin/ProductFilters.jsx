import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function ProductFilters({
  filters = { search: '', categoryId: '', isActive: '', isFeatured: '', sortBy: '', order: 'asc' },
  categories = [],
  onFilterChange,
  onReset
}) {
  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const isFiltered = filters.search || filters.categoryId || filters.isActive || filters.isFeatured;

  return (
    <div style={filterPanel}>
      <div style={panelHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} color="var(--accent-admin-amber)" />
          <h3 style={headerTitle}>Filter Catalog</h3>
        </div>
        {isFiltered && (
          <button onClick={onReset} style={resetBtn}>
            Reset
          </button>
        )}
      </div>

      <div style={filtersGrid}>
        {/* Search */}
        <div style={filterGroup}>
          <label style={labelStyle}>Search</label>
          <div style={searchWrap}>
            <Search size={14} style={searchIcon} />
            <input
              type="text"
              placeholder="Search Name, SKU, Tag..."
              style={searchInput}
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
            {filters.search && (
              <button onClick={() => handleChange('search', '')} style={clearSearchBtn}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Category */}
        <div style={filterGroup}>
          <label style={labelStyle}>Category</label>
          <select
            style={selectInput}
            value={filters.categoryId || ''}
            onChange={(e) => handleChange('categoryId', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent ? `${c.parent.name} → ` : ''}{c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

const filterPanel = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  marginBottom: '1.5rem'
};

const panelHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '1rem',
  borderBottom: '1px solid var(--border-admin)',
  paddingBottom: '0.5rem'
};

const headerTitle = {
  fontSize: '0.875rem',
  fontWeight: 600,
  margin: 0,
  color: 'var(--text-admin-bright)'
};

const resetBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--accent-admin-amber)',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const filtersGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem'
};

const filterGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const labelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
  fontWeight: 500
};

const searchWrap = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const searchIcon = {
  position: 'absolute',
  left: '0.75rem',
  color: 'var(--text-admin-muted)'
};

const searchInput = {
  width: '100%',
  padding: '0.45rem 1.75rem 0.45rem 2rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none'
};

const clearSearchBtn = {
  position: 'absolute',
  right: '0.5rem',
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  cursor: 'pointer',
  padding: '0.15rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const selectInput = {
  width: '100%',
  padding: '0.45rem 0.75rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '8px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.8125rem',
  outline: 'none',
  cursor: 'pointer'
};

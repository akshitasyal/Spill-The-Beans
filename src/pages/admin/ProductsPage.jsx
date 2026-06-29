import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ProductService } from '../../services/ProductService';
import { CategoryService } from '../../services/CategoryService';
import { SectionHeader } from './AdminLayout';
import ProductFilters from '../../components/admin/ProductFilters';
import BulkActionMenu from '../../components/admin/BulkActionMenu';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { Plus, Eye, Edit3, Copy, Archive, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductsPage() {
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    isActive: '',
    isFeatured: '',
    sortBy: 'name',
    order: 'asc'
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch Category lists once
  useEffect(() => {
    CategoryService.getCategories().then(res => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  // Fetch Products based on page & filter state
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) setLoading(true);
    }, 0);

    ProductService.queryProducts({
      ...filters,
      page: pagination.page,
      limit: pagination.limit
    }).then(res => {
      clearTimeout(timer);
      if (active && res.success) {
        setProducts(res.data);
        setPagination(res.pagination);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters, pagination.page, pagination.limit]);

  // Row Selection Helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    const isAsc = filters.sortBy === field && filters.order === 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      order: isAsc ? 'desc' : 'asc'
    }));
    setPagination(p => ({ ...p, page: 1 }));
  };

  // Actions
  const handleDuplicate = async (product) => {
    const dupData = {
      ...product,
      name: `${product.name} (Copy)`,
      sku: product.sku ? `${product.sku}-COPY` : '',
      slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`
    };
    delete dupData.id;
    delete dupData.createdAt;

    const res = await ProductService.createProduct(dupData);
    if (res.success) {
      // Refresh list
      setPagination(p => ({ ...p, page: 1 }));
      alert('Product duplicated successfully.');
    }
  };

  const handleArchive = async (id, isActive) => {
    const res = await ProductService.updateProduct(id, { isActive: !isActive });
    if (res.success) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !isActive } : p));
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const res = await ProductService.deleteProduct(deleteId);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== deleteId));
        setSelectedIds(prev => prev.filter(x => x !== deleteId));
      }
    }
    setDeleteId(null);
    setShowConfirmModal(false);
  };

  // Bulk Actions
  const handleBulkActionTrigger = (actionType) => {
    setBulkAction(actionType);
    setShowConfirmModal(true);
  };

  const executeBulkAction = async () => {
    if (bulkAction === 'delete') {
      await ProductService.bulkDelete(selectedIds);
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
    } else if (bulkAction === 'activate') {
      await ProductService.bulkUpdateStatus(selectedIds, true);
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isActive: true } : p));
    } else if (bulkAction === 'deactivate') {
      await ProductService.bulkUpdateStatus(selectedIds, false);
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isActive: false } : p));
    } else if (bulkAction === 'feature') {
      await ProductService.bulkUpdateFeatured(selectedIds, true);
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isFeatured: true } : p));
    } else if (bulkAction === 'unfeature') {
      await ProductService.bulkUpdateFeatured(selectedIds, false);
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isFeatured: false } : p));
    }

    setSelectedIds([]);
    setBulkAction(null);
    setShowConfirmModal(false);
  };

  const exportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Product Name,SKU,Category,Price,Sale Price,Stock,Status"].join(",") + "\n"
      + products.map(p => `"${p.name}","${p.sku || ''}","${p.category?.name || 'Coffee'}","${p.price}","${p.salePrice || ''}","${p.stock}","${p.isActive ? 'Active' : 'Inactive'}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stb_products_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <SectionHeader title="Products" subtitle="Manage catalog items, pricing, inventory, and details.">
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportCsv} className="admin-navbar__btn" style={{ border: '1px solid var(--border-admin)', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8125rem' }}>
            Export CSV
          </button>
          <button onClick={() => navigate('/admin/products/new')} className="admin-navbar__btn admin-navbar__btn--quickadd">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </SectionHeader>

      {/* Filters Banner */}
      <ProductFilters
        filters={filters}
        categories={categories}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPagination(p => ({ ...p, page: 1 }));
        }}
        onReset={() => setFilters({ search: '', categoryId: '', isActive: '', isFeatured: '', sortBy: 'name', order: 'asc' })}
      />

      {/* Table grid wrapper */}
      <div className="recent-orders-card" style={{ overflowX: 'auto', position: 'relative' }}>
        {loading ? (
          <div style={skeletonWrapper}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={skeletonLine} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={products.length > 0 && selectedIds.length === products.length}
                    />
                  </th>
                  <th>Image</th>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    Product Name <ArrowUpDown size={12} style={sortIcon} />
                  </th>
                  <th onClick={() => handleSort('sku')} style={{ cursor: 'pointer' }}>
                    SKU <ArrowUpDown size={12} style={sortIcon} />
                  </th>
                  <th>Category</th>
                  <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                    Price <ArrowUpDown size={12} style={sortIcon} />
                  </th>
                  <th>Sale Price</th>
                  <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                    Stock <ArrowUpDown size={12} style={sortIcon} />
                  </th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr key={p.id} style={isChecked ? selectedRowStyle : undefined}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(p.id)}
                        />
                      </td>
                      <td>
                        <img
                          src={p.image || p.images?.[0] || 'https://via.placeholder.com/40'}
                          alt={p.name}
                          style={imgThumbStyle}
                        />
                      </td>
                      <td style={{ fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </td>
                      <td><code style={skuCode}>{p.sku || '—'}</code></td>
                      <td>{p.category?.name || 'Coffee'}</td>
                      <td>₹{p.price}</td>
                      <td>{p.salePrice ? `₹${p.salePrice}` : '—'}</td>
                      <td>
                        <span style={p.stock <= 15 ? lowStockBadge : undefined}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-badge--${p.isActive ? 'delivered' : 'cancelled'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '1.1rem' }}>
                          {p.isFeatured ? '⭐' : '—'}
                        </span>
                      </td>
                      <td>
                        <div style={actionsRow}>
                          <Link to={`/products/${p.slug}`} style={iconAction} title="View live product page">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => navigate(`/admin/products/${p.id}/edit`)} style={iconAction} title="Edit product details">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDuplicate(p)} style={iconAction} title="Duplicate product details">
                            <Copy size={14} />
                          </button>
                          <button onClick={() => handleArchive(p.id, p.isActive)} style={iconAction} title={p.isActive ? 'Deactivate/Archive item' : 'Activate item'}>
                            <Archive size={14} />
                          </button>
                          <button onClick={() => openDeleteModal(p.id)} style={{ ...iconAction, color: '#d32f2f' }} title="Delete item">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={paginationRow}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-admin-muted)' }}>
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                  <span>Items per page:</span>
                  <select
                    style={pageLimitSelect}
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }));
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page === 1}
                    style={pagBtn}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                      style={{
                        ...pagBtn,
                        ...(pagination.page === i + 1 ? activePagBtn : undefined)
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    style={pagBtn}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={emptyWrapper}>
            <span style={{ fontSize: '2.5rem' }}>☕</span>
            <h3>No Products Found</h3>
            <p>Try resetting filters or add a new coffee product to get started.</p>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions menu */}
      <BulkActionMenu
        selectedCount={selectedIds.length}
        onAction={handleBulkActionTrigger}
      />

      {/* Security Deletion Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title={bulkAction ? 'Confirm Bulk Operation' : 'Delete Product Catalog Item'}
        message={
          bulkAction
            ? `Are you sure you want to perform bulk '${bulkAction}' action on ${selectedIds.length} selected items?`
            : "Are you sure you want to delete this product? This action is permanent and will remove the item from active storefront catalogs."
        }
        confirmText={bulkAction ? 'Apply Action' : 'Delete Product'}
        onConfirm={bulkAction ? executeBulkAction : confirmDelete}
        onCancel={() => {
          setShowConfirmModal(false);
          setBulkAction(null);
          setDeleteId(null);
        }}
      />
    </div>
  );
}

// Styling definitions
const imgThumbStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '6px',
  objectFit: 'cover',
  border: '1px solid var(--border-admin)',
  background: '#1a0a0a'
};

const skuCode = {
  fontSize: '0.75rem',
  color: 'var(--accent-admin-amber)',
  background: 'rgba(194, 122, 10, 0.05)',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px'
};

const sortIcon = {
  marginLeft: '0.25rem',
  display: 'inline-block',
  verticalAlign: 'middle',
  opacity: 0.7
};

const selectedRowStyle = {
  background: 'rgba(253, 224, 193, 0.02)'
};

const lowStockBadge = {
  color: '#d32f2f',
  fontWeight: 'bold',
  background: 'rgba(211,47,47,0.1)',
  padding: '0.15rem 0.4rem',
  borderRadius: '4px'
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
  justifyContent: 'center',
  textDecoration: 'none'
};

const paginationRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '1.5rem',
  paddingTop: '1rem',
  borderTop: '1px solid var(--border-admin)'
};

const pageLimitSelect = {
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  padding: '0.25rem 0.5rem',
  borderRadius: '6px',
  outline: 'none',
  cursor: 'pointer'
};

const pagBtn = {
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-muted)',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8125rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const activePagBtn = {
  background: 'var(--accent-admin-amber)',
  color: '#FFFFFF',
  borderColor: 'var(--accent-admin-amber)'
};

const skeletonWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '2rem 1rem'
};

const skeletonLine = {
  height: '24px',
  background: 'rgba(253,224,193,0.04)',
  borderRadius: '4px',
  animation: 'pulse 1.5s infinite'
};

const emptyWrapper = {
  padding: '4rem 2rem',
  textAlign: 'center',
  color: 'var(--text-admin-muted)'
};

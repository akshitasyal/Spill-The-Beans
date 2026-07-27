import { useState, useEffect, useCallback } from 'react';
import { ReviewService } from '../../services/ReviewService';
import { SectionHeader } from './AdminLayout';
import { Star, Check, X, Trash2, RefreshCw, Search, ChevronRight, MessageSquare } from 'lucide-react';
import ConfirmationModal from '../../components/admin/ConfirmationModal';


// Extend ReviewService mock with richer data
function getEnrichedReviews() {
  const reviews = JSON.parse(localStorage.getItem('stb_admin_reviews') || 'null');
  if (!reviews) return null;
  return reviews.map(r => ({
    ...r,
    status: r.status || (r.isApproved ? 'APPROVED' : 'PENDING'),
    adminNote: r.adminNote || ''
  }));
}

function saveEnrichedReviews(reviews) {
  localStorage.setItem('stb_admin_reviews', JSON.stringify(reviews));
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerReview, setDrawerReview] = useState(null);
  const [drawerNote, setDrawerNote] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadReviews = useCallback(() => {
    ReviewService.getReviews().then(res => {
      if (res.success) {
        let data = res.data.map(r => ({
          ...r,
          status: r.status || (r.isApproved ? 'APPROVED' : 'PENDING')
        }));
        if (ratingFilter) data = data.filter(r => r.rating === parseInt(ratingFilter));
        if (statusFilter) data = data.filter(r => r.status === statusFilter);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          data = data.filter(r =>
            r.title?.toLowerCase().includes(q) ||
            r.body?.toLowerCase().includes(q) ||
            r.user?.name?.toLowerCase().includes(q) ||
            r.product?.name?.toLowerCase().includes(q)
          );
        }
        setReviews(data);
      }
      setLoading(false);
    });
  }, [ratingFilter, statusFilter, searchQuery]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    ReviewService.getReviews().then(res => {
      if (active && res.success) {
        let data = res.data.map(r => ({
          ...r,
          status: r.status || (r.isApproved ? 'APPROVED' : 'PENDING')
        }));
        if (ratingFilter) data = data.filter(r => r.rating === parseInt(ratingFilter));
        if (statusFilter) data = data.filter(r => r.status === statusFilter);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          data = data.filter(r =>
            r.title?.toLowerCase().includes(q) ||
            r.body?.toLowerCase().includes(q) ||
            r.user?.name?.toLowerCase().includes(q) ||
            r.product?.name?.toLowerCase().includes(q)
          );
        }
        setReviews(data);
      }
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [ratingFilter, statusFilter, searchQuery]);

  const updateStatus = (id, status) => {
    const allReviews = getEnrichedReviews() || reviews;
    const idx = allReviews.findIndex(r => r.id === id);
    if (idx > -1) {
      const updated = allReviews.map((r, i) => i === idx ? { ...r, status, isApproved: status === 'APPROVED' } : r);
      saveEnrichedReviews(updated);
    }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status, isApproved: status === 'APPROVED' } : r));
    if (drawerReview?.id === id) setDrawerReview(prev => ({ ...prev, status, isApproved: status === 'APPROVED' }));
    showToast(`Review ${status.toLowerCase()}.`);
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) return;
    const status = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : null;
    if (status) {
      const allReviews = getEnrichedReviews() || reviews;
      allReviews.forEach((r, i) => {
        if (selectedIds.includes(r.id)) {
          allReviews[i] = { ...r, status, isApproved: status === 'APPROVED' };
        }
      });
      saveEnrichedReviews(allReviews);
      setReviews(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status, isApproved: status === 'APPROVED' } : r));
      showToast(`${selectedIds.length} reviews ${status.toLowerCase()}.`);
    } else if (action === 'delete') {
      setPendingDeleteId('bulk');
      setShowDeleteModal(true);
    }
    setSelectedIds([]);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId === 'bulk') {
      for (const id of selectedIds) {
        await ReviewService.deleteReview(id);
      }
      setReviews(prev => prev.filter(r => !selectedIds.includes(r.id)));
      showToast(`Deleted ${selectedIds.length} reviews.`);
      setSelectedIds([]);
    } else {
      await ReviewService.deleteReview(pendingDeleteId);
      setReviews(prev => prev.filter(r => r.id !== pendingDeleteId));
      showToast('Review deleted.');
      if (drawerReview?.id === pendingDeleteId) setDrawerReview(null);
    }
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  const openDrawer = (review) => {
    setDrawerReview(review);
    setDrawerNote(review.adminNote || '');
  };

  const saveNote = () => {
    const allReviews = getEnrichedReviews() || reviews;
    const idx = allReviews.findIndex(r => r.id === drawerReview.id);
    if (idx > -1) {
      const updated = allReviews.map((r, i) => i === idx ? { ...r, adminNote: drawerNote } : r);
      saveEnrichedReviews(updated);
    }
    setReviews(prev => prev.map(r => r.id === drawerReview.id ? { ...r, adminNote: drawerNote } : r));
    setDrawerReview(prev => ({ ...prev, adminNote: drawerNote }));
    showToast('Admin note saved.');
  };

  // Stats
  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;
  const approvedCount = reviews.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = reviews.filter(r => r.status === 'REJECTED').length;

  const Stars = ({ n }) => (
    <div style={{ display: 'flex', gap: '0.1rem' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} color={i < n ? '#e5a93b' : 'var(--text-admin-muted)'} fill={i < n ? '#e5a93b' : 'none'} />
      ))}
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <SectionHeader title="Reviews Moderation" subtitle="Approve, reject, or flag product reviews and ratings.">
        <button onClick={loadReviews} style={iconBtn}><RefreshCw size={14} /></button>
      </SectionHeader>

      {/* Stats */}
      <div style={statsRow}>
        <StatPill color="#f59e0b" label="Pending" value={pendingCount} onClick={() => setStatusFilter(statusFilter === 'PENDING' ? '' : 'PENDING')} active={statusFilter === 'PENDING'} />
        <StatPill color="#10b981" label="Approved" value={approvedCount} onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? '' : 'APPROVED')} active={statusFilter === 'APPROVED'} />
        <StatPill color="#ef4444" label="Rejected" value={rejectedCount} onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? '' : 'REJECTED')} active={statusFilter === 'REJECTED'} />
        <StatPill color="#6b7280" label="Total" value={reviews.length} onClick={() => setStatusFilter('')} active={statusFilter === ''} />
      </div>

      {/* Toolbar */}
      <div style={toolbar}>
        <div style={searchWrap}>
          <Search size={13} style={searchIcon} />
          <input type="text" placeholder="Search by title, customer, product…" style={searchInput} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select style={selectEl} value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
          <option value="">All Ratings</option>
          {['5', '4', '3', '2', '1'].map(r => <option key={r} value={r}>{r} Star{r !== '1' ? 's' : ''}</option>)}
        </select>
        <select style={selectEl} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => handleBulkAction('approve')} style={approveBtn}><Check size={13} /> Approve {selectedIds.length}</button>
            <button onClick={() => handleBulkAction('reject')} style={rejectBtn}><X size={13} /> Reject {selectedIds.length}</button>
            <button onClick={() => handleBulkAction('delete')} style={deleteBtn}><Trash2 size={13} /> Delete {selectedIds.length}</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="recent-orders-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <SkeletonRows />
        ) : reviews.length === 0 ? (
          <div style={emptyState}>
            <MessageSquare size={32} color="var(--text-admin-muted)" />
            <p style={{ color: 'var(--text-admin-muted)' }}>No reviews match your filters.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? reviews.map(r => r.id) : [])} checked={selectedIds.length === reviews.length && reviews.length > 0} /></th>
                <th>Rating</th>
                <th>Product</th>
                <th>Review</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => setSelectedIds(prev => prev.includes(r.id) ? prev.filter(x => x !== r.id) : [...prev, r.id])} /></td>
                  <td><Stars n={r.rating} /></td>
                  <td style={{ fontWeight: 600, fontSize: '0.8125rem', maxWidth: '120px' }}>{r.product?.name}</td>
                  <td style={{ maxWidth: '260px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.15rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>{r.body}</div>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-admin-muted)' }}>{r.user?.email}</div>
                  </td>
                  <td>
                    <span style={{ ...statusPill, ...getStatusStyle(r.status) }}>{r.status || 'PENDING'}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      {r.status !== 'APPROVED' && (
                        <button onClick={() => updateStatus(r.id, 'APPROVED')} style={iconActionBtn} title="Approve">
                          <Check size={13} color="#10b981" />
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button onClick={() => updateStatus(r.id, 'REJECTED')} style={iconActionBtn} title="Reject">
                          <X size={13} color="#f59e0b" />
                        </button>
                      )}
                      <button onClick={() => openDrawer(r)} style={iconActionBtn} title="View details">
                        <ChevronRight size={13} color="var(--text-admin-muted)" />
                      </button>
                      <button onClick={() => { setPendingDeleteId(r.id); setShowDeleteModal(true); }} style={iconActionBtn} title="Delete">
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Drawer */}
      {drawerReview && (
        <>
          <div style={drawerBackdrop} onClick={() => setDrawerReview(null)} />
          <div style={drawer}>
            <div style={drawerHeader}>
              <h3 style={drawerTitle}>Review Detail</h3>
              <button onClick={() => setDrawerReview(null)} style={closeBtn}><X size={16} /></button>
            </div>
            <div style={drawerBody}>
              <div style={drawerSection}>
                <div style={drawerLabel}>Product</div>
                <div style={drawerValue}>{drawerReview.product?.name}</div>
              </div>
              <div style={drawerSection}>
                <div style={drawerLabel}>Customer</div>
                <div style={drawerValue}>{drawerReview.user?.name}</div>
                <div style={{ ...drawerValue, fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>{drawerReview.user?.email}</div>
              </div>
              <div style={drawerSection}>
                <div style={drawerLabel}>Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} color={i < drawerReview.rating ? '#e5a93b' : 'var(--text-admin-muted)'} fill={i < drawerReview.rating ? '#e5a93b' : 'none'} />
                  ))}
                  <span style={{ color: 'var(--text-admin-bright)', fontWeight: 700 }}>{drawerReview.rating}/5</span>
                </div>
              </div>
              <div style={drawerSection}>
                <div style={drawerLabel}>Review Title</div>
                <div style={{ ...drawerValue, fontWeight: 700, fontSize: '0.9375rem' }}>{drawerReview.title}</div>
              </div>
              <div style={drawerSection}>
                <div style={drawerLabel}>Review Body</div>
                <div style={{ ...drawerValue, lineHeight: 1.6, color: 'var(--text-admin-muted)' }}>{drawerReview.body}</div>
              </div>
              <div style={drawerSection}>
                <div style={drawerLabel}>Status</div>
                <span style={{ ...statusPill, ...getStatusStyle(drawerReview.status) }}>{drawerReview.status || 'PENDING'}</span>
              </div>
              <div style={drawerSection}>
                <div style={drawerLabel}>Submitted</div>
                <div style={drawerValue}>{new Date(drawerReview.createdAt).toLocaleString()}</div>
              </div>
              <div style={drawerSection}>
                <div style={drawerLabel}>Admin Note (Internal)</div>
                <textarea rows={3} style={noteInput} value={drawerNote} onChange={e => setDrawerNote(e.target.value)} placeholder="Private moderation note…" />
                <button onClick={saveNote} style={saveNoteBtn}>Save Note</button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {drawerReview.status !== 'APPROVED' && (
                  <button onClick={() => updateStatus(drawerReview.id, 'APPROVED')} style={{ ...approveBtn, flex: 1, justifyContent: 'center' }}>
                    <Check size={13} /> Approve
                  </button>
                )}
                {drawerReview.status !== 'REJECTED' && (
                  <button onClick={() => updateStatus(drawerReview.id, 'REJECTED')} style={{ ...rejectBtn, flex: 1, justifyContent: 'center' }}>
                    <X size={13} /> Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Review(s)"
        message={pendingDeleteId === 'bulk' ? `Permanently delete ${selectedIds.length} reviews?` : 'Permanently delete this review?'}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
      />

      {toast && <div style={toastEl}>{toast}</div>}
    </div>
  );
}

function StatPill({ color, label, value, onClick, active }) {
  return (
    <button onClick={onClick} style={{ background: active ? color + '14' : 'var(--bg-admin-card)', border: `1px solid ${active ? color : 'var(--border-admin)'}`, borderRadius: '10px', padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: active ? color : 'var(--text-admin-bright)' }}>{value}</span>
      <span style={{ fontSize: '0.7rem', color: active ? color : 'var(--text-admin-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
    </button>
  );
}

function SkeletonRows() {
  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ height: '40px', background: 'rgba(253,224,193,0.04)', borderRadius: '6px' }} />
      ))}
    </div>
  );
}

function getStatusStyle(status) {
  if (status === 'APPROVED') return { background: 'rgba(16,185,129,0.1)', color: '#10b981' };
  if (status === 'REJECTED') return { background: 'rgba(239,68,68,0.1)', color: '#ef4444' };
  return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
}

// Styles
const statsRow = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' };
const toolbar = { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' };
const searchWrap = { position: 'relative', flex: 1, minWidth: '200px', maxWidth: '340px' };
const searchIcon = { position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-admin-muted)' };
const searchInput = { width: '100%', padding: '0.45rem 0.75rem 0.45rem 2rem', background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box' };
const selectEl = { padding: '0.45rem 0.6rem', background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem', outline: 'none', cursor: 'pointer' };
const iconBtn = { background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const approveBtn = { display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16,185,129,0.1)', border: 'none', color: '#10b981', padding: '0.4rem 0.65rem', borderRadius: '7px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' };
const rejectBtn = { display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245,158,11,0.1)', border: 'none', color: '#f59e0b', padding: '0.4rem 0.65rem', borderRadius: '7px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' };
const deleteBtn = { display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.4rem 0.65rem', borderRadius: '7px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' };
const iconActionBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', borderRadius: '4px' };
const statusPill = { padding: '0.15rem 0.55rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 };
const emptyState = { padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' };
const drawerBackdrop = { position: 'fixed', inset: 0, background: 'rgba(8,3,3,0.5)', zIndex: 800 };
const drawer = { position: 'fixed', top: 0, right: 0, height: '100vh', width: '420px', maxWidth: '90vw', background: 'var(--bg-admin-card)', borderLeft: '1px solid var(--border-admin)', zIndex: 801, overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.4)' };
const drawerHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border-admin)', position: 'sticky', top: 0, background: 'var(--bg-admin-card)', zIndex: 1 };
const drawerTitle = { margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-admin-bright)' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-admin-muted)', display: 'flex', alignItems: 'center' };
const drawerBody = { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0' };
const drawerSection = { padding: '0.875rem 0', borderBottom: '1px dashed var(--border-admin)' };
const drawerLabel = { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-admin-muted)', marginBottom: '0.3rem', letterSpacing: '0.4px' };
const drawerValue = { fontSize: '0.875rem', color: 'var(--text-admin-bright)' };
const noteInput = { width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: '0.5rem' };
const saveNoteBtn = { background: 'var(--accent-admin-amber)', border: 'none', color: '#FFF', padding: '0.4rem 0.85rem', borderRadius: '7px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' };
const toastEl = { position: 'fixed', bottom: '2rem', right: '2rem', background: '#2e7d32', color: '#FFF', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };

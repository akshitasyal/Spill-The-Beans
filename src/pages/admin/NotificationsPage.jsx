import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../../services/NotificationService';
import { SectionHeader } from './AdminLayout';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchNotifications = useCallback(() => {
    NotificationService.getNotifications({ type: typeFilter, onlyUnread }).then(res => {
      if (res.success) { setNotifications(res.data); setCurrentPage(1); }
      setLoading(false);
    });
  }, [typeFilter, onlyUnread]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    NotificationService.getNotifications({ type: typeFilter, onlyUnread }).then(res => {
      if (active && res.success) { setNotifications(res.data); setCurrentPage(1); }
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [typeFilter, onlyUnread]);

  const handleMarkRead = async (id) => {
    await NotificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = async (id) => {
    await NotificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Notification deleted.');
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read.');
  };

  const handleClearRead = async () => {
    await NotificationService.clearAllRead();
    setNotifications(prev => prev.filter(n => !n.isRead));
    showToast('Cleared all read notifications.');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const paginated = notifications.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <SectionHeader
        title="Notification Center"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleMarkAllRead} style={outlineBtn}>
            <CheckCheck size={13} /> Mark All Read
          </button>
          <button onClick={handleClearRead} style={dangerBtn}>
            <Trash2 size={13} /> Clear Read
          </button>
        </div>
      </SectionHeader>

      {/* Summary Type Cards */}
      <div style={typeGrid}>
        {Object.entries(NotificationService.TYPES).map(([key, info]) => {
          const count = notifications.filter(n => n.type === key).length;
          const unread = notifications.filter(n => n.type === key && !n.isRead).length;
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
              style={{ ...typeCard, border: `1px solid ${typeFilter === key ? info.color : 'var(--border-admin)'}`, background: typeFilter === key ? info.color + '12' : 'var(--bg-admin-card)' }}
            >
              <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-admin-bright)' }}>{info.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-admin-muted)' }}>{count} total · {unread} unread</div>
              </div>
              {unread > 0 && <span style={{ ...unreadBadge, background: info.color }}>{unread}</span>}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div style={filterBar}>
        <label style={toggleLabel}>
          <input type="checkbox" checked={onlyUnread} onChange={e => setOnlyUnread(e.target.checked)} style={{ marginRight: '0.35rem' }} />
          Show unread only
        </label>
        {typeFilter && (
          <button onClick={() => setTypeFilter('')} style={clearFilterBtn}>
            <Filter size={12} /> Clear filter: {NotificationService.TYPES[typeFilter]?.label}
          </button>
        )}
      </div>

      {/* Notification List */}
      <div style={notifList}>
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} style={skeletonItem} />
          ))
        ) : paginated.length === 0 ? (
          <div style={emptyState}>
            <Bell size={32} color="var(--text-admin-muted)" />
            <p style={{ color: 'var(--text-admin-muted)', fontSize: '0.875rem' }}>No notifications match your filter.</p>
          </div>
        ) : (
          paginated.map(n => (
            <div
              key={n.id}
              style={{ ...notifItem, background: n.isRead ? 'var(--bg-admin-card)' : 'rgba(194,122,10,0.04)', borderLeft: `3px solid ${n.isRead ? 'var(--border-admin)' : n.color}` }}
            >
              <div style={{ ...notifIcon, background: n.color + '18', color: n.color }}>{n.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                  <span style={{ ...typePill, background: n.color + '14', color: n.color }}>{n.label}</span>
                  {!n.isRead && <span style={unreadDot} />}
                </div>
                <div style={notifMsg}>{n.message}</div>
                <div style={notifTime}>{timeAgo(n.createdAt)}</div>
              </div>
              <div style={notifActions}>
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n.id)} style={actionBtn} title="Mark as read">
                    <Check size={13} />
                  </button>
                )}
                <button onClick={() => handleDelete(n.id)} style={{ ...actionBtn, color: '#ef4444' }} title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationRow}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-admin-muted)' }}>
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, notifications.length)} of {notifications.length}
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={pageBtn} disabled={currentPage === 1}>Prev</button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} style={(i + 1) === currentPage ? activePgBtn : pageBtn}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={pageBtn} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      )}

      {toast && <div style={toastEl}>{toast}</div>}
    </div>
  );
}

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Styles
const outlineBtn = { display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer' };
const dangerBtn = { display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 };
const typeGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' };
const typeCard = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' };
const unreadBadge = { minWidth: '20px', height: '20px', borderRadius: '10px', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.3rem' };
const filterBar = { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' };
const toggleLabel = { display: 'flex', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--text-admin-muted)', cursor: 'pointer' };
const clearFilterBtn = { display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(253,224,193,0.03)', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' };
const notifList = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const skeletonItem = { height: '70px', borderRadius: '10px', background: 'rgba(253,224,193,0.04)' };
const emptyState = { padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' };
const notifItem = { display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid var(--border-admin)' };
const notifIcon = { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 };
const typePill = { fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.1rem 0.4rem', borderRadius: '4px' };
const unreadDot = { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-admin-amber)', flexShrink: 0 };
const notifMsg = { fontSize: '0.8125rem', color: 'var(--text-admin-bright)', lineHeight: 1.4 };
const notifTime = { fontSize: '0.7rem', color: 'var(--text-admin-muted)', marginTop: '0.2rem' };
const notifActions = { display: 'flex', gap: '0.25rem', flexShrink: 0 };
const actionBtn = { background: 'none', border: 'none', color: 'var(--text-admin-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', borderRadius: '4px' };
const paginationRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' };
const pageBtn = { background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' };
const activePgBtn = { background: 'var(--accent-admin-amber)', border: 'none', color: '#FFF', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' };
const toastEl = { position: 'fixed', bottom: '2rem', right: '2rem', background: '#2e7d32', color: '#FFF', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };

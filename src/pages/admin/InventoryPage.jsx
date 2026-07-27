import { useState, useEffect } from 'react';
import { InventoryService } from '../../services/InventoryService';
import { SectionHeader } from './AdminLayout';
import { RefreshCw, ArrowUp, ArrowDown, Settings, ListFilter, Calendar } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'history'

  // Adjustment Modal/Inline States
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustVal, setAdjustVal] = useState('');
  const [adjustThresholdId, setAdjustThresholdId] = useState(null);
  const [thresholdVal, setThresholdVal] = useState('');

  const fetchInventory = () => {
    Promise.all([
      InventoryService.getInventory(),
      InventoryService.getInventoryHistory()
    ]).then(([invRes, logRes]) => {
      if (invRes.success) setInventory(invRes.data);
      if (logRes.success) setLogs(logRes.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (id, prevStock, direction) => {
    if (!adjustVal || isNaN(adjustVal) || Number(adjustVal) <= 0) {
      alert('Enter a valid positive number for adjustment');
      return;
    }

    const change = Number(adjustVal) * direction;
    const nextStock = Math.max(0, prevStock + change);
    const reason = change > 0 ? 'Restock increment' : 'Fulfillment deduction';

    const res = await InventoryService.updateStock(id, nextStock, reason);
    if (res.success) {
      fetchInventory();
      setAdjustingId(null);
      setAdjustVal('');
    }
  };

  const handleSetThresholdSubmit = async (e, id) => {
    e.preventDefault();
    if (!thresholdVal || isNaN(thresholdVal) || Number(thresholdVal) < 0) {
      alert('Enter a valid non-negative number');
      return;
    }

    const res = await InventoryService.updateThreshold(id, thresholdVal);
    if (res.success) {
      fetchInventory();
      setAdjustThresholdId(null);
      setThresholdVal('');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'In Stock') return 'status-badge--delivered';
    if (status === 'Low Stock') return 'status-badge--pending';
    return 'status-badge--cancelled';
  };

  return (
    <div>
      <SectionHeader title="Inventory" subtitle="Track and audit stock count for whole bean roasts and accessories.">
        <button onClick={() => { setLoading(true); fetchInventory(); }} className="admin-navbar__btn" style={{ border: '1px solid var(--border-admin)', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </SectionHeader>

      {/* Tabs */}
      <div style={tabsRow}>
        <button
          onClick={() => setActiveTab('stock')}
          style={{ ...tabBtn, ...(activeTab === 'stock' ? activeTabBtn : undefined) }}
        >
          <ListFilter size={14} /> Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{ ...tabBtn, ...(activeTab === 'history' ? activeTabBtn : undefined) }}
        >
          <Calendar size={14} /> Audit History Ledger
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-admin-bright)' }}>Loading inventory databases...</div>
      ) : activeTab === 'stock' ? (
        /* Stock Levels Table View */
        <div className="recent-orders-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Reserved Stock</th>
                <th>Available Stock</th>
                <th>Low Stock Threshold</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td><code style={skuCode}>{item.sku}</code></td>
                  <td>{item.stock}</td>
                  <td style={{ color: 'var(--text-admin-muted)' }}>{item.reservedStock}</td>
                  <td style={{ fontWeight: 600 }}>{item.availableStock}</td>
                  <td>
                    {adjustThresholdId === item.id ? (
                      <form onSubmit={(e) => handleSetThresholdSubmit(e, item.id)} style={{ display: 'flex', gap: '0.25rem' }}>
                        <input
                          type="number"
                          value={thresholdVal}
                          onChange={(e) => setThresholdVal(e.target.value)}
                          style={inlineInput}
                          placeholder={String(item.lowStockThreshold)}
                        />
                        <button type="submit" style={inlineSubmitBtn} title="Save">✓</button>
                        <button type="button" onClick={() => setAdjustThresholdId(null)} style={inlineCancelBtn} title="Cancel">✗</button>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{item.lowStockThreshold} units</span>
                        <button onClick={() => { setAdjustThresholdId(item.id); setThresholdVal(item.lowStockThreshold); }} style={editInlineBtn}>
                          <Settings size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={actionsRow}>
                      {adjustingId === item.id ? (
                        <div style={{ ...adjustWrapper, display: 'flex', gap: '0.25rem' }}>
                          <input
                            type="number"
                            value={adjustVal}
                            onChange={(e) => setAdjustVal(e.target.value)}
                            style={inlineInput}
                            placeholder="Qty"
                          />
                          <button 
                            type="button" 
                            onClick={() => handleAdjustStock(item.id, item.stock, 1)} 
                            style={{ ...inlineSubmitBtn, background: '#2e7d32', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                            title="Add stock"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleAdjustStock(item.id, item.stock, -1)} 
                            style={{ ...inlineSubmitBtn, background: '#d32f2f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                            title="Subtract stock"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => { setAdjustingId(null); setAdjustVal(''); }} 
                            style={{ ...inlineCancelBtn, cursor: 'pointer' }}
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setAdjustingId(item.id); setAdjustVal(''); }} style={adjustTriggerBtn}>
                          Adjust Quantity
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Audit History Logs Table View */
        <div className="recent-orders-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity Change</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Adjustment Reason</th>
                <th>Administrator</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.productName}</td>
                  <td style={{ fontWeight: 'bold', color: log.change.startsWith('+') ? '#2e7d32' : '#d32f2f' }}>
                    {log.change}
                  </td>
                  <td>{log.previousStock} units</td>
                  <td>{log.newStock} units</td>
                  <td>{log.reason}</td>
                  <td>{log.admin}</td>
                  <td style={{ color: 'var(--text-admin-muted)', fontSize: '0.75rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Inline Styles
const tabsRow = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1.5rem',
  borderBottom: '1px solid var(--border-admin)',
  paddingBottom: '0.5rem'
};

const tabBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  position: 'relative'
};

const activeTabBtn = {
  color: 'var(--text-admin-bright)',
  borderBottom: '2px solid var(--accent-admin-amber)'
};

const skuCode = {
  fontSize: '0.75rem',
  color: 'var(--accent-admin-amber)',
  background: 'rgba(194, 122, 10, 0.05)',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px'
};

const actionsRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center'
};

const editInlineBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-admin-muted)',
  cursor: 'pointer',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const inlineInput = {
  width: '60px',
  padding: '0.2rem 0.4rem',
  background: 'rgba(253,224,193,0.02)',
  border: '1px solid var(--border-admin)',
  borderRadius: '4px',
  color: 'var(--text-admin-bright)',
  fontSize: '0.75rem',
  outline: 'none'
};

const inlineSubmitBtn = {
  border: 'none',
  background: 'var(--accent-admin-amber)',
  color: '#FFFFFF',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const inlineCancelBtn = {
  border: '1px solid var(--border-admin)',
  background: 'none',
  color: 'var(--text-admin-muted)',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const adjustTriggerBtn = {
  background: 'none',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  borderRadius: '6px',
  padding: '0.35rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const adjustWrapper = {
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(253,224,193,0.01)',
  border: '1px solid var(--border-admin)',
  borderRadius: '6px',
  padding: '0.25rem'
};

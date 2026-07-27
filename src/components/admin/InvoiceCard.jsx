import PropTypes from 'prop-types';
import { InvoiceService } from '../../services/InvoiceService';
import { Printer, Download, FileText } from 'lucide-react';

export default function InvoiceCard({ order }) {
  if (!order) return null;

  const handlePrint = (e) => {
    e?.preventDefault();
    InvoiceService.printInvoice(order);
  };

  const handleDownload = (e) => {
    e?.preventDefault();
    InvoiceService.downloadInvoicePDF(order);
  };

  return (
    <div style={cardStyle}>
      <div style={headerRow}>
        <div style={titleBox}>
          <FileText size={18} color="var(--accent-admin-amber)" />
          <h3 style={titleText}>Invoice & Receipts</h3>
        </div>
        <div style={btnGroup}>
          <button onClick={handlePrint} style={btnStyle} title="Print Invoice">
            <Printer size={14} /> Print
          </button>
          <button onClick={handleDownload} style={downloadBtn} title="Download PDF Receipt">
            <Download size={14} /> PDF
          </button>
        </div>
      </div>
      <p style={descText}>
        Generate a tax receipt invoice for package shipping, packaging inserts, or digital customer records.
      </p>
    </div>
  );
}

InvoiceCard.propTypes = {
  order: PropTypes.object.isRequired
};

const cardStyle = {
  background: 'var(--bg-admin-card)',
  border: '1px solid var(--border-admin)',
  borderRadius: '12px',
  padding: '1.25rem',
  marginTop: '1.5rem'
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.75rem',
  flexWrap: 'wrap',
  gap: '1rem'
};

const titleBox = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const titleText = {
  fontSize: '0.875rem',
  fontWeight: 600,
  margin: 0,
  color: 'var(--text-admin-bright)'
};

const btnGroup = {
  display: 'flex',
  gap: '0.5rem'
};

const btnStyle = {
  background: 'rgba(253, 224, 193, 0.02)',
  border: '1px solid var(--border-admin)',
  color: 'var(--text-admin-bright)',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  cursor: 'pointer',
  fontWeight: 600
};

const downloadBtn = {
  background: 'var(--accent-admin-amber)',
  border: 'none',
  color: '#FFFFFF',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  cursor: 'pointer',
  fontWeight: 600
};

const descText = {
  fontSize: '0.75rem',
  color: 'var(--text-admin-muted)',
  margin: 0,
  lineHeight: 1.4
};

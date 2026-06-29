import { useState, useEffect } from 'react';
import { SettingsService } from '../../services/SettingsService';
import { SectionHeader } from './AdminLayout';
import { Save, RotateCcw, Store, CreditCard, Truck, Receipt, Share2, Search, AlertTriangle } from 'lucide-react';

const SECTIONS = [
  { key: 'general', label: 'General', icon: Store },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'taxes', label: 'Taxes', icon: Receipt },
  { key: 'social', label: 'Social Media', icon: Share2 },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'maintenance', label: 'Maintenance', icon: AlertTriangle }
];

const TIMEZONES = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Singapore'];
const CURRENCIES = [{ code: 'INR', symbol: '₹', name: 'Indian Rupee' }, { code: 'USD', symbol: '$', name: 'US Dollar' }, { code: 'EUR', symbol: '€', name: 'Euro' }];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: '', isError: false });

  const showToast = (msg, isError = false) => { setToast({ msg, isError }); setTimeout(() => setToast({ msg: '' }), 3500); };

  useEffect(() => {
    let active = true;
    SettingsService.getSettings().then(res => {
      if (active && res.success) setSettings(res.data);
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const updateField = (section, field, value) => {
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const updateNestedField = (section, parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: { ...prev[section][parent], [field]: value }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await SettingsService.updateSection(activeSection, settings[activeSection]);
      if (res.success) showToast(`${SECTIONS.find(s => s.key === activeSection)?.label} settings saved.`);
      else showToast('Failed to save settings.', true);
    } catch {
      showToast('An error occurred.', true);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!confirm('Reset this section to defaults?')) return;
    const res = await SettingsService.resetSection(activeSection);
    if (res.success) {
      setSettings(prev => ({ ...prev, [activeSection]: res.data }));
      showToast('Section reset to defaults.');
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-admin-muted)' }}>Loading settings…</div>;

  return (
    <div>
      <SectionHeader title="Store Settings" subtitle="Configure your store's global preferences, integrations, and behaviour." />

      <div style={layoutGrid}>
        {/* Sidebar */}
        <div style={sidebarPanel}>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.key} onClick={() => setActiveSection(s.key)} style={{ ...sidebarBtn, background: activeSection === s.key ? 'rgba(194,122,10,0.1)' : 'none', color: activeSection === s.key ? 'var(--accent-admin-amber)' : 'var(--text-admin-muted)', borderLeft: `3px solid ${activeSection === s.key ? 'var(--accent-admin-amber)' : 'transparent'}` }}>
                <Icon size={16} /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div style={contentPanel}>
          {/* ── GENERAL ── */}
          {activeSection === 'general' && (
            <SettingsSection title="General Settings" description="Core store identity and contact information.">
              <Field label="Store Name" value={settings.general.storeName} onChange={v => updateField('general', 'storeName', v)} />
              <Field label="Store Email" value={settings.general.storeEmail} type="email" onChange={v => updateField('general', 'storeEmail', v)} />
              <Field label="Phone Number" value={settings.general.phone} onChange={v => updateField('general', 'phone', v)} />
              <Field label="Business Address" value={settings.general.address} multiline onChange={v => updateField('general', 'address', v)} />
              <SelectField label="Timezone" value={settings.general.timezone} options={TIMEZONES.map(t => ({ value: t, label: t }))} onChange={v => updateField('general', 'timezone', v)} />
              <SelectField label="Currency" value={settings.general.currency} options={CURRENCIES.map(c => ({ value: c.code, label: `${c.symbol} ${c.name}` }))} onChange={v => updateField('general', 'currency', v)} />
            </SettingsSection>
          )}

          {/* ── PAYMENTS ── */}
          {activeSection === 'payments' && (
            <SettingsSection title="Payment Settings" description="Configure and enable payment gateways for your store.">
              <PaymentGateway title="Razorpay" logo="🟦" enabled={settings.payments.razorpay.enabled} onToggle={v => updateNestedField('payments', 'razorpay', 'enabled', v)}>
                <Field label="Key ID" value={settings.payments.razorpay.keyId} placeholder="rzp_test_XXXXXXXXXX" onChange={v => updateNestedField('payments', 'razorpay', 'keyId', v)} />
                <Field label="Key Secret" value={settings.payments.razorpay.keySecret} type="password" placeholder="••••••••••••" onChange={v => updateNestedField('payments', 'razorpay', 'keySecret', v)} />
                <ToggleField label="Live Mode" value={settings.payments.razorpay.liveMode} onChange={v => updateNestedField('payments', 'razorpay', 'liveMode', v)} hint="Toggle off for test/sandbox mode" />
              </PaymentGateway>
              <PaymentGateway title="Stripe" logo="💜" enabled={settings.payments.stripe.enabled} onToggle={v => updateNestedField('payments', 'stripe', 'enabled', v)}>
                <Field label="Publishable Key" value={settings.payments.stripe.publishableKey} placeholder="pk_test_XXXXXXXXXXXX" onChange={v => updateNestedField('payments', 'stripe', 'publishableKey', v)} />
                <Field label="Secret Key" value={settings.payments.stripe.secretKey} type="password" placeholder="••••••••••••" onChange={v => updateNestedField('payments', 'stripe', 'secretKey', v)} />
              </PaymentGateway>
              <PaymentGateway title="Cash on Delivery" logo="💵" enabled={settings.payments.cod.enabled} onToggle={v => updateNestedField('payments', 'cod', 'enabled', v)}>
                <Field label="Max Order Amount (₹)" value={settings.payments.cod.maxOrderAmount / 100} type="number" onChange={v => updateNestedField('payments', 'cod', 'maxOrderAmount', Math.round(parseFloat(v) * 100))} />
                <Field label="Extra COD Charge (₹)" value={settings.payments.cod.extraCharge / 100} type="number" onChange={v => updateNestedField('payments', 'cod', 'extraCharge', Math.round(parseFloat(v) * 100))} />
              </PaymentGateway>
            </SettingsSection>
          )}

          {/* ── SHIPPING ── */}
          {activeSection === 'shipping' && (
            <SettingsSection title="Shipping Settings" description="Shipping rates, delivery windows, and zone configuration.">
              <Field label="Flat Shipping Rate (₹)" value={settings.shipping.flatRate / 100} type="number" onChange={v => updateField('shipping', 'flatRate', Math.round(parseFloat(v) * 100))} />
              <Field label="Free Shipping Threshold (₹)" value={settings.shipping.freeShippingThreshold / 100} type="number" hint="Set 0 to disable free shipping" onChange={v => updateField('shipping', 'freeShippingThreshold', Math.round(parseFloat(v) * 100))} />
              <div style={twoColGrid}>
                <Field label="Min Delivery Days" value={settings.shipping.deliveryTimeMin} type="number" onChange={v => updateField('shipping', 'deliveryTimeMin', parseInt(v))} />
                <Field label="Max Delivery Days" value={settings.shipping.deliveryTimeMax} type="number" onChange={v => updateField('shipping', 'deliveryTimeMax', parseInt(v))} />
              </div>
              <div style={infoBox}>
                <strong>Shipping Zones</strong>
                {settings.shipping.zones.map((z, i) => (
                  <div key={i} style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(253,224,193,0.02)', borderRadius: '8px', border: '1px solid var(--border-admin)', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-admin-bright)' }}>{z.name}</div>
                    <div style={{ color: 'var(--text-admin-muted)' }}>{Array.isArray(z.states) ? z.states.join(', ') : z.states} — ₹{(z.rate / 100).toFixed(0)} flat</div>
                  </div>
                ))}
              </div>
            </SettingsSection>
          )}

          {/* ── TAXES ── */}
          {activeSection === 'taxes' && (
            <SettingsSection title="Tax Configuration" description="GST and tax inclusion settings for India.">
              <ToggleField label="Enable GST" value={settings.taxes.gstEnabled} onChange={v => updateField('taxes', 'gstEnabled', v)} />
              <ToggleField label="Prices Include GST" value={settings.taxes.gstIncluded} onChange={v => updateField('taxes', 'gstIncluded', v)} hint="If ON, displayed prices already include tax" />
              <Field label="GST Percentage (%)" value={settings.taxes.gstPercentage} type="number" onChange={v => updateField('taxes', 'gstPercentage', parseFloat(v))} />
              <Field label="GST Number" value={settings.taxes.gstNumber} placeholder="29AAAAA0000A1Z5" onChange={v => updateField('taxes', 'gstNumber', v)} />
            </SettingsSection>
          )}

          {/* ── SOCIAL ── */}
          {activeSection === 'social' && (
            <SettingsSection title="Social Media Links" description="Link your social channels shown in the store footer.">
              {['instagram', 'facebook', 'twitter', 'linkedin', 'youtube'].map(platform => (
                <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)} value={settings.social[platform]} placeholder={`https://${platform}.com/spillthebeans`} onChange={v => updateField('social', platform, v)} />
              ))}
            </SettingsSection>
          )}

          {/* ── SEO ── */}
          {activeSection === 'seo' && (
            <SettingsSection title="SEO & Tracking" description="Search engine optimization and analytics integration.">
              <Field label="Site Title" value={settings.seo.siteTitle} onChange={v => updateField('seo', 'siteTitle', v)} />
              <Field label="Meta Description" value={settings.seo.metaDescription} multiline onChange={v => updateField('seo', 'metaDescription', v)} />
              <Field label="Keywords (comma-separated)" value={settings.seo.keywords} onChange={v => updateField('seo', 'keywords', v)} />
              <div style={divider} />
              <Field label="Google Analytics ID" value={settings.seo.googleAnalyticsId} placeholder="G-XXXXXXXXXX" onChange={v => updateField('seo', 'googleAnalyticsId', v)} />
              <Field label="Facebook Pixel ID" value={settings.seo.facebookPixelId} placeholder="1234567890123456" onChange={v => updateField('seo', 'facebookPixelId', v)} />
              <Field label="Google Search Console Key" value={settings.seo.googleSearchConsoleKey} placeholder="Verification meta tag value" onChange={v => updateField('seo', 'googleSearchConsoleKey', v)} />
            </SettingsSection>
          )}

          {/* ── MAINTENANCE ── */}
          {activeSection === 'maintenance' && (
            <SettingsSection title="Maintenance Mode" description="Temporarily take the storefront offline for maintenance.">
              <div style={maintenanceWarning}>
                <AlertTriangle size={16} color="#f59e0b" />
                <span>Enabling maintenance mode will show a maintenance page to all non-admin visitors.</span>
              </div>
              <ToggleField label="Enable Maintenance Mode" value={settings.maintenance.enabled} onChange={v => updateField('maintenance', 'enabled', v)} />
              <Field label="Maintenance Message" value={settings.maintenance.message} multiline onChange={v => updateField('maintenance', 'message', v)} />
              <Field label="Estimated Return Time" value={settings.maintenance.estimatedReturn} placeholder="e.g. 2 hours, or a specific date/time" onChange={v => updateField('maintenance', 'estimatedReturn', v)} />
            </SettingsSection>
          )}

          {/* Action Buttons */}
          <div style={actionRow}>
            <button onClick={handleReset} style={resetBtn}>
              <RotateCcw size={14} /> Reset to Defaults
            </button>
            <button onClick={handleSave} style={saveBtn} disabled={saving}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {toast.msg && (
        <div style={{ ...toastEl, background: toast.isError ? '#d32f2f' : '#2e7d32' }}>{toast.msg}</div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SettingsSection({ title, description, children }) {
  return (
    <div>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>{title}</h2>
        <p style={sectionDesc}>{description}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, type = 'text', placeholder, multiline, hint, onChange }) {
  return (
    <div style={fieldGroup}>
      <label style={fieldLabel}>{label}</label>
      {hint && <div style={fieldHint}>{hint}</div>}
      {multiline ? (
        <textarea rows={3} style={textareaEl} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      ) : (
        <input type={type} style={inputEl} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div style={fieldGroup}>
      <label style={fieldLabel}>{label}</label>
      <select style={selectEl} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ToggleField({ label, value, hint, onChange }) {
  return (
    <div style={toggleRow}>
      <div>
        <div style={fieldLabel}>{label}</div>
        {hint && <div style={fieldHint}>{hint}</div>}
      </div>
      <button onClick={() => onChange(!value)} style={{ ...toggleBtn, background: value ? 'var(--accent-admin-amber)' : 'rgba(253,224,193,0.06)' }}>
        <div style={{ ...toggleThumb, transform: value ? 'translateX(20px)' : 'translateX(2px)' }} />
      </button>
    </div>
  );
}

function PaymentGateway({ title, logo, enabled, onToggle, children }) {
  return (
    <div style={{ background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: enabled ? '1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-admin-bright)', fontSize: '0.9375rem' }}>
          <span>{logo}</span> {title}
        </div>
        <button onClick={() => onToggle(!enabled)} style={{ ...toggleBtn, background: enabled ? 'var(--accent-admin-amber)' : 'rgba(253,224,193,0.06)' }}>
          <div style={{ ...toggleThumb, transform: enabled ? 'translateX(20px)' : 'translateX(2px)' }} />
        </button>
      </div>
      {enabled && <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{children}</div>}
    </div>
  );
}

// Styles
const layoutGrid = { display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' };
const sidebarPanel = { background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '12px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', position: 'sticky', top: '5rem' };
const sidebarBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'left', width: '100%' };
const contentPanel = { background: 'var(--bg-admin-card)', border: '1px solid var(--border-admin)', borderRadius: '12px', padding: '1.75rem' };
const sectionHeader = { marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-admin)' };
const sectionTitle = { margin: '0 0 0.25rem', fontSize: '1.0625rem', fontWeight: 'bold', color: 'var(--text-admin-bright)' };
const sectionDesc = { margin: 0, fontSize: '0.8125rem', color: 'var(--text-admin-muted)' };
const fieldGroup = { display: 'flex', flexDirection: 'column', gap: '0.3rem' };
const fieldLabel = { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-admin-muted)', letterSpacing: '0.4px' };
const fieldHint = { fontSize: '0.7rem', color: 'var(--text-admin-muted)', fontStyle: 'italic' };
const inputEl = { padding: '0.5rem 0.75rem', background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const textareaEl = { padding: '0.5rem 0.75rem', background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' };
const selectEl = { padding: '0.5rem 0.75rem', background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '8px', color: 'var(--text-admin-bright)', fontSize: '0.8125rem', outline: 'none', cursor: 'pointer', width: '100%' };
const toggleRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', gap: '1rem' };
const toggleBtn = { width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' };
const toggleThumb = { position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#FFF', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' };
const twoColGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const infoBox = { background: 'rgba(253,224,193,0.02)', border: '1px solid var(--border-admin)', borderRadius: '10px', padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-admin-muted)' };
const divider = { borderTop: '1px dashed var(--border-admin)', margin: '0.5rem 0' };
const maintenanceWarning = { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8125rem', color: '#f59e0b' };
const actionRow = { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-admin)' };
const resetBtn = { display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: '1px solid var(--border-admin)', color: 'var(--text-admin-muted)', padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer' };
const saveBtn = { display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--accent-admin-amber)', border: 'none', color: '#FFF', padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' };
const toastEl = { position: 'fixed', bottom: '2rem', right: '2rem', color: '#FFF', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };

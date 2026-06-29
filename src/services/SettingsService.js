// SettingsService.js — Persists all store settings in localStorage

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

const DEFAULT_SETTINGS = {
  general: {
    storeName: 'Spill The Beans',
    storeEmail: 'hello@spillthebeans.in',
    phone: '+91 98765 43210',
    address: '12, Coffee Lane, Koramangala, Bengaluru, Karnataka — 560034',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    logoUrl: '',
    faviconUrl: ''
  },
  payments: {
    razorpay: { enabled: true, liveMode: false, keyId: '', keySecret: '' },
    stripe: { enabled: false, liveMode: false, publishableKey: '', secretKey: '' },
    cod: { enabled: true, maxOrderAmount: 300000, extraCharge: 0 }
  },
  shipping: {
    flatRate: 4900,
    freeShippingThreshold: 49900,
    deliveryTimeMin: 3,
    deliveryTimeMax: 7,
    zones: [
      { name: 'Metro Cities', states: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad'], rate: 4900 },
      { name: 'Rest of India', states: ['*'], rate: 6900 }
    ]
  },
  taxes: {
    gstEnabled: true,
    gstIncluded: false,
    gstPercentage: 18,
    gstNumber: '29AAAAA0000A1Z5'
  },
  social: {
    instagram: 'https://instagram.com/spillthebeans.in',
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: ''
  },
  seo: {
    siteTitle: 'Spill The Beans — Premium Indian Coffee',
    metaDescription: 'Discover India\'s finest specialty soluble coffees, artisanal blends, and single-origin beans delivered to your doorstep.',
    keywords: 'specialty coffee, soluble coffee, hazelnut coffee, mocha coffee, India',
    googleAnalyticsId: '',
    facebookPixelId: '',
    googleSearchConsoleKey: ''
  },
  maintenance: {
    enabled: false,
    message: 'We\'re brewing something amazing. Back soon!',
    estimatedReturn: ''
  }
};

function getLocalSettings() {
  const local = localStorage.getItem('stb_admin_settings');
  if (!local) {
    localStorage.setItem('stb_admin_settings', JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  // Deep merge with defaults to handle new keys added in updates
  const stored = JSON.parse(local);
  return {
    general: { ...DEFAULT_SETTINGS.general, ...stored.general },
    payments: { ...DEFAULT_SETTINGS.payments, ...stored.payments },
    shipping: { ...DEFAULT_SETTINGS.shipping, ...stored.shipping },
    taxes: { ...DEFAULT_SETTINGS.taxes, ...stored.taxes },
    social: { ...DEFAULT_SETTINGS.social, ...stored.social },
    seo: { ...DEFAULT_SETTINGS.seo, ...stored.seo },
    maintenance: { ...DEFAULT_SETTINGS.maintenance, ...stored.maintenance }
  };
}

function saveLocalSettings(settings) {
  localStorage.setItem('stb_admin_settings', JSON.stringify(settings));
}

export const SettingsService = {
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      return { success: true, data: getLocalSettings() };
    }
  },

  async updateSection(section, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/${section}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      const settings = getLocalSettings();
      settings[section] = { ...settings[section], ...data };
      saveLocalSettings(settings);
      return { success: true, data: settings[section] };
    }
  },

  async resetSection(section) {
    const settings = getLocalSettings();
    settings[section] = DEFAULT_SETTINGS[section];
    saveLocalSettings(settings);
    return { success: true, data: settings[section] };
  },

  DEFAULT_SETTINGS
};

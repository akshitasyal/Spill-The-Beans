// NewsletterService.js — 500 mock subscribers with full CRUD and export

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

const SOURCES = ['Website Popup', 'Checkout Opt-in', 'Blog Footer', 'Instagram Link', 'Referral', 'Manual Import'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com'];
const FIRST_NAMES = ['Aarav', 'Aisha', 'Arjun', 'Bhavya', 'Deepika', 'Dev', 'Esha', 'Farhan', 'Gauri',
  'Harsh', 'Isha', 'Jai', 'Kavya', 'Lakshmi', 'Manav', 'Nisha', 'Om', 'Pooja', 'Rahul', 'Sanya',
  'Tanvi', 'Uday', 'Vani', 'Vivek', 'Yash', 'Zara', 'Kiran', 'Priya', 'Rohit', 'Sneha'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Nair', 'Iyer', 'Roy',
  'Das', 'Kapoor', 'Mehta', 'Bose', 'Joshi', 'Pillai', 'Menon', 'Shah', 'Rao', 'Bhat', 'Mishra'];

function seededRandom(seed) {
  let x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateSubscribers() {
  return Array.from({ length: 500 }, (_, i) => {
    const fn = FIRST_NAMES[Math.floor(seededRandom(i * 3) * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(seededRandom(i * 7) * LAST_NAMES.length)];
    const domain = DOMAINS[Math.floor(seededRandom(i * 11) * DOMAINS.length)];
    const daysAgo = Math.floor(seededRandom(i * 13) * 730);
    const isActive = seededRandom(i * 17) > 0.12;
    return {
      id: `nl-${String(i + 1).padStart(4, '0')}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 20 ? i : ''}@${domain}`,
      name: `${fn} ${ln}`,
      status: isActive ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
      source: SOURCES[Math.floor(seededRandom(i * 19) * SOURCES.length)],
      subscribedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      lastEmailSentAt: seededRandom(i * 23) > 0.3
        ? new Date(Date.now() - Math.floor(seededRandom(i * 29) * 30) * 86400000).toISOString()
        : null
    };
  });
}

function getLocalSubscribers() {
  const local = localStorage.getItem('stb_admin_newsletter');
  if (!local) {
    const data = generateSubscribers();
    localStorage.setItem('stb_admin_newsletter', JSON.stringify(data));
    return data;
  }
  return JSON.parse(local);
}

function saveLocalSubscribers(subscribers) {
  localStorage.setItem('stb_admin_newsletter', JSON.stringify(subscribers));
}

export const NewsletterService = {
  async getSubscribers({ search = '', status = '' } = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter?search=${encodeURIComponent(search)}&status=${status}`);
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      let data = getLocalSubscribers();
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(s => s.email.toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q));
      }
      if (status) data = data.filter(s => s.status === status);
      return { success: true, data };
    }
  },

  async deleteSubscriber(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch {
      let subs = getLocalSubscribers();
      subs = subs.filter(s => s.id !== id);
      saveLocalSubscribers(subs);
      return { success: true };
    }
  },

  async bulkDelete(ids) {
    let subs = getLocalSubscribers();
    subs = subs.filter(s => !ids.includes(s.id));
    saveLocalSubscribers(subs);
    return { success: true };
  },

  async exportCSV(subscribers) {
    const rows = [
      'Email,Name,Status,Source,Subscribed Date',
      ...subscribers.map(s =>
        `${s.email},"${s.name || ''}",${s.status},${s.source},${new Date(s.subscribedAt).toLocaleDateString()}`
      )
    ].join('\n');
    return rows;
  }
};

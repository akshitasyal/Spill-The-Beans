import { fetchWithAuth } from './apiClient';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

export const ReviewService = {
  async getReviews() {
    let apiReviews = [];
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/reviews`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          apiReviews = json.data;
        }
      }
    } catch (_e) {
      // API unavailable or network offline
    }

    let localReviews = [];
    let adminReviews = [];
    try {
      localReviews = JSON.parse(localStorage.getItem('stb_product_reviews') || '[]');
    } catch (_e) {}
    try {
      adminReviews = JSON.parse(localStorage.getItem('stb_admin_reviews') || '[]');
    } catch (_e) {}

    const mergedMap = {};

    // 1. Local customer reviews
    localReviews.forEach(r => {
      const key = r.id || `rev-loc-${Math.random()}`;
      mergedMap[key] = {
        ...r,
        id: key,
        status: r.status || (r.isApproved !== false ? 'APPROVED' : 'PENDING'),
        user: r.user || { name: r.userName || 'Verified Buyer', email: r.userEmail || '' },
        product: r.product || { name: r.productName || 'Coffee Product' }
      };
    });

    // 2. Admin local reviews
    adminReviews.forEach(r => {
      if (r.id) {
        mergedMap[r.id] = {
          ...r,
          status: r.status || (r.isApproved !== false ? 'APPROVED' : 'PENDING'),
          user: r.user || { name: r.userName || 'Verified Buyer', email: r.userEmail || '' },
          product: r.product || { name: r.productName || 'Coffee Product' }
        };
      }
    });

    // 3. API reviews
    apiReviews.forEach(r => {
      if (r.id) {
        mergedMap[r.id] = {
          ...r,
          status: r.status || (r.isApproved !== false ? 'APPROVED' : 'PENDING'),
          user: r.user || { name: r.userName || 'Verified Buyer', email: r.userEmail || '' },
          product: r.product || { name: r.productName || 'Coffee Product' }
        };
      }
    });

    const combined = Object.values(mergedMap).sort(
      (a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
    );

    return { success: true, data: combined };
  },

  async updateReviewStatus(id, isApproved) {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (_e) {}

    // Update in local storage
    try {
      const status = isApproved ? 'APPROVED' : 'REJECTED';
      const local = JSON.parse(localStorage.getItem('stb_product_reviews') || '[]');
      const updatedLocal = local.map(r => r.id === id ? { ...r, isApproved, status } : r);
      localStorage.setItem('stb_product_reviews', JSON.stringify(updatedLocal));

      const admin = JSON.parse(localStorage.getItem('stb_admin_reviews') || '[]');
      const updatedAdmin = admin.map(r => r.id === id ? { ...r, isApproved, status } : r);
      localStorage.setItem('stb_admin_reviews', JSON.stringify(updatedAdmin));
    } catch (_e) {}

    return { success: true };
  },

  async deleteReview(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (_e) {}

    // Delete in local storage
    try {
      const local = JSON.parse(localStorage.getItem('stb_product_reviews') || '[]');
      localStorage.setItem('stb_product_reviews', JSON.stringify(local.filter(r => r.id !== id)));

      const admin = JSON.parse(localStorage.getItem('stb_admin_reviews') || '[]');
      localStorage.setItem('stb_admin_reviews', JSON.stringify(admin.filter(r => r.id !== id)));
    } catch (_e) {}

    return { success: true, message: 'Review deleted successfully.' };
  },

  async createReview(reviewData) {
    const newRev = {
      id: `rev-${Date.now()}`,
      rating: reviewData.rating || 5,
      title: reviewData.title || '',
      body: reviewData.body || '',
      userName: reviewData.userName || 'Verified Buyer',
      userEmail: reviewData.userEmail || '',
      productName: reviewData.productName || 'Coffee Product',
      isApproved: reviewData.isApproved !== undefined ? reviewData.isApproved : true,
      status: reviewData.isApproved !== false ? 'APPROVED' : 'PENDING',
      createdAt: new Date().toISOString(),
      ...reviewData
    };

    // 1. Immediately save to localStorage stb_product_reviews
    try {
      const existing = JSON.parse(localStorage.getItem('stb_product_reviews') || '[]');
      existing.unshift(newRev);
      localStorage.setItem('stb_product_reviews', JSON.stringify(existing));
    } catch (_e) {}

    // 2. Post to backend API
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json;
        }
      }
    } catch (_e) {}

    return { success: true, data: newRev };
  }
};

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

const MOCK_REVIEWS = [
  { id: 'rev-001', rating: 5, title: 'Amazing chocolate flavour!', body: 'Best mocha soluble I have ever tried. Highly recommend it to chocolate and coffee lovers alike.', isApproved: true, createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), user: { name: 'Asha Patel', email: 'asha.patel@example.com' }, product: { name: 'Mocha pe Chauka Gourmet Soluble' } },
  { id: 'rev-002', rating: 5, title: 'Heavenly aroma', body: 'The toasted hazelnut flavor is so smooth. Literally smells like a bakery in the morning.', isApproved: true, createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), user: { name: 'Devendra Sharma', email: 'devendra@example.com' }, product: { name: 'Hazelnut Bliss Instant' } },
  { id: 'rev-003', rating: 4, title: 'Sweet and creamy', body: 'Very aromatic French vanilla taste. Good strength overall.', isApproved: true, createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(), user: { name: 'Rohan Mehra', email: 'rohan.mehra@example.com' }, product: { name: 'Vanilla Dream Soluble' } },
  { id: 'rev-004', rating: 5, title: 'Perfect espresso kick', body: 'Super strong and intense caffeine hit. Tastes rich and walnut-like. Perfect for black coffee.', isApproved: true, createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(), user: { name: 'Kritika Roy', email: 'kritika.roy@example.com' }, product: { name: 'Raat Ki Rani Espresso' } },
  { id: 'rev-005', rating: 2, title: 'A bit too sweet for me', body: 'The caramel flavor is nice but too sweet if you do not add extra milk. Decent quality.', isApproved: false, createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(), user: { name: 'Siddharth Sen', email: 'sid.sen@example.com' }, product: { name: 'Caramel Surge Coffee' } },
  { id: 'rev-006', rating: 5, title: 'Superb quality beans', body: 'Shade-grown organic taste is obvious. Lovely subtle citrus notes.', isApproved: true, createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(), user: { name: 'Ananya Goel', email: 'ananya.goel@example.com' }, product: { name: 'Araku Valley Single Origin' } },
  { id: 'rev-007', rating: 1, title: 'Damaged Jar on arrival', body: 'The coffee package was fine but the glass jar was chipped at the lid. Disappointed with shipping.', isApproved: false, createdAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(), user: { name: 'Kabir Das', email: 'kabir.das@example.com' }, product: { name: 'Hazelnut Bliss Instant' } },
  { id: 'rev-008', rating: 5, title: 'Handy little frother', body: 'Builds super thick cream on espresso instantly. Strong motor!', isApproved: true, createdAt: new Date(Date.now() - 3600000 * 24 * 22).toISOString(), user: { name: 'Priya Nair', email: 'priya.nair@example.com' }, product: { name: 'Milk Frother Pro' } }
];

function getLocalReviews() {
  const local = localStorage.getItem('stb_admin_reviews');
  if (!local) {
    localStorage.setItem('stb_admin_reviews', JSON.stringify(MOCK_REVIEWS));
    return MOCK_REVIEWS;
  }
  return JSON.parse(local);
}

function saveLocalReviews(reviews) {
  localStorage.setItem('stb_admin_reviews', JSON.stringify(reviews));
}

export const ReviewService = {
  async getReviews() {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`);
      if (!res.ok) throw new Error('API server error');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ ReviewService.getReviews falling back to localStorage:', err.message);
      const reviews = getLocalReviews();
      return { success: true, data: reviews };
    }
  },

  async updateReviewStatus(id, isApproved) {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      });
      if (!res.ok) throw new Error('Could not update review status');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ ReviewService.updateReviewStatus falling back to localStorage:', err.message);
      const reviews = getLocalReviews();
      const idx = reviews.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Review not found', { cause: err });

      reviews[idx] = {
        ...reviews[idx],
        isApproved: isApproved
      };

      saveLocalReviews(reviews);
      return { success: true, data: reviews[idx] };
    }
  },

  async deleteReview(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Could not delete review');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ ReviewService.deleteReview falling back to localStorage:', err.message);
      let reviews = getLocalReviews();
      reviews = reviews.filter(r => r.id !== id);
      saveLocalReviews(reviews);
      return { success: true };
    }
  }
};

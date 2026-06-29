const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin`;

const MOCK_COUPONS = [
  { id: 'cpn-001', code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrderAmount: 49900, maxDiscount: 10000, usageLimit: 500, usageCount: 145, isActive: true, expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString() },
  { id: 'cpn-002', code: 'STBFREE', type: 'FREE_SHIPPING', value: 0, minOrderAmount: 29900, maxDiscount: null, usageLimit: 1000, usageCount: 280, isActive: true, expiresAt: new Date(Date.now() + 3600000 * 24 * 15).toISOString() },
  { id: 'cpn-003', code: 'BREW50', type: 'FIXED', value: 5000, minOrderAmount: 39900, maxDiscount: 5000, usageLimit: 200, usageCount: 88, isActive: true, expiresAt: new Date(Date.now() + 3600000 * 24 * 10).toISOString() },
  { id: 'cpn-004', code: 'SUPER300', type: 'FIXED', value: 30000, minOrderAmount: 199900, maxDiscount: 30000, usageLimit: 50, usageCount: 12, isActive: true, expiresAt: new Date(Date.now() + 3600000 * 24 * 60).toISOString() },
  { id: 'cpn-005', code: 'EXPIRED20', type: 'PERCENTAGE', value: 20, minOrderAmount: 99900, maxDiscount: 15000, usageLimit: 100, usageCount: 100, isActive: false, expiresAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
  { id: 'cpn-006', code: 'ARABICA15', type: 'PERCENTAGE', value: 15, minOrderAmount: 59900, maxDiscount: null, usageLimit: null, usageCount: 45, isActive: true, expiresAt: null }
];

function getLocalCoupons() {
  const local = localStorage.getItem('stb_admin_coupons');
  if (!local) {
    localStorage.setItem('stb_admin_coupons', JSON.stringify(MOCK_COUPONS));
    return MOCK_COUPONS;
  }
  return JSON.parse(local);
}

function saveLocalCoupons(coupons) {
  localStorage.setItem('stb_admin_coupons', JSON.stringify(coupons));
}

export const CouponService = {
  async getCoupons() {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`);
      if (!res.ok) throw new Error('API server error');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CouponService.getCoupons falling back to localStorage:', err.message);
      const coupons = getLocalCoupons();
      return { success: true, data: coupons };
    }
  },

  async createCoupon(couponData) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData)
      });
      if (!res.ok) throw new Error('Could not create coupon');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CouponService.createCoupon falling back to localStorage:', err.message);
      const coupons = getLocalCoupons();
      
      const newCoupon = {
        ...couponData,
        id: `cpn-${Date.now()}`,
        code: couponData.code.toUpperCase(),
        value: Number(couponData.value),
        minOrderAmount: couponData.minOrderAmount ? Number(couponData.minOrderAmount) : null,
        maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : null,
        usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : null,
        usageCount: 0,
        isActive: couponData.isActive !== undefined ? couponData.isActive : true,
        createdAt: new Date().toISOString()
      };

      const exists = coupons.some(c => c.code.toLowerCase() === newCoupon.code.toLowerCase());
      if (exists) throw new Error('Coupon code already exists', { cause: err });

      coupons.unshift(newCoupon);
      saveLocalCoupons(coupons);
      return { success: true, data: newCoupon };
    }
  },

  async updateCoupon(id, couponData) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData)
      });
      if (!res.ok) throw new Error('Could not update coupon');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CouponService.updateCoupon falling back to localStorage:', err.message);
      const coupons = getLocalCoupons();
      const idx = coupons.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Coupon not found', { cause: err });

      if (couponData.code && couponData.code.toUpperCase() !== coupons[idx].code) {
        const exists = coupons.some(c => c.code.toLowerCase() === couponData.code.toLowerCase());
        if (exists) throw new Error('Coupon code already exists', { cause: err });
      }

      coupons[idx] = {
        ...coupons[idx],
        ...couponData,
        code: couponData.code ? couponData.code.toUpperCase() : coupons[idx].code,
        value: couponData.value !== undefined ? Number(couponData.value) : coupons[idx].value,
        minOrderAmount: couponData.minOrderAmount !== undefined ? (couponData.minOrderAmount ? Number(couponData.minOrderAmount) : null) : coupons[idx].minOrderAmount,
        maxDiscount: couponData.maxDiscount !== undefined ? (couponData.maxDiscount ? Number(couponData.maxDiscount) : null) : coupons[idx].maxDiscount,
        usageLimit: couponData.usageLimit !== undefined ? (couponData.usageLimit ? Number(couponData.usageLimit) : null) : coupons[idx].usageLimit,
        expiresAt: couponData.expiresAt !== undefined ? couponData.expiresAt : coupons[idx].expiresAt,
        isActive: couponData.isActive !== undefined ? couponData.isActive : coupons[idx].isActive
      };

      saveLocalCoupons(coupons);
      return { success: true, data: coupons[idx] };
    }
  },

  async deleteCoupon(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Could not delete coupon');
      return await res.json();
    } catch (err) {
      console.warn('⚠️ CouponService.deleteCoupon falling back to localStorage:', err.message);
      let coupons = getLocalCoupons();
      coupons = coupons.filter(c => c.id !== id);
      saveLocalCoupons(coupons);
      return { success: true };
    }
  },

  async validateCoupon(code, subtotal) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: Math.round(subtotal * 100) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid coupon');
      return {
        success: true,
        discountPercent: data.data.type === 'PERCENTAGE' ? data.data.value : null,
        discountAmount: Math.round(data.data.discount / 100),
        coupon: data.data
      };
    } catch (err) {
      console.warn('⚠️ CouponService.validateCoupon falling back to localStorage:', err.message);
      
      const coupons = getLocalCoupons();
      const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

      if (!coupon) {
        throw new Error('Invalid promo code.');
      }
      if (!coupon.isActive) {
        throw new Error('This coupon is inactive.');
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new Error('This coupon has expired.');
      }
      const subtotalPaise = Math.round(subtotal * 100);
      if (coupon.minOrderAmount && subtotalPaise < coupon.minOrderAmount) {
        throw new Error(`Minimum order amount of ₹${coupon.minOrderAmount / 100} required.`);
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new Error('This coupon has reached its usage limit.');
      }

      let discountAmount = 0;
      if (coupon.type === 'PERCENTAGE') {
        discountAmount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.maxDiscount && discountAmount > (coupon.maxDiscount / 100)) {
          discountAmount = coupon.maxDiscount / 100;
        }
      } else if (coupon.type === 'FIXED') {
        discountAmount = coupon.value / 100;
      }

      return {
        success: true,
        discountPercent: coupon.type === 'PERCENTAGE' ? coupon.value : null,
        discountAmount,
        coupon
      };
    }
  }
};

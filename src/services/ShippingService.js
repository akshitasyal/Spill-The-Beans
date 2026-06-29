export const ShippingService = {
  async getCourierPartners() {
    return ['Delhivery', 'BlueDart', 'XpressBees', 'DTDC', 'FedEx India'];
  },

  calculateEstimatedDelivery(shippingDateString) {
    if (!shippingDateString) return null;
    const date = new Date(shippingDateString);
    // Standard estimated delivery is shipping date + 2 days
    date.setDate(date.getDate() + 2);
    return date.toISOString();
  }
};

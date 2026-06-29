/**
 * Format raw currency values (paise/cents) into display rupees
 * @param {number} amount - Amount in paise (e.g. 49900 for ₹499.00)
 * @returns {string} Formatted string
 */
export function formatPrice(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

/**
 * Truncate long descriptions cleanly
 * @param {string} text - Input text
 * @param {number} limit - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, limit = 100) {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.slice(0, limit).trim() + '...';
}

/**
 * Generate a unique SEO slug from titles
 * @param {string} text - Title or name
 * @returns {string} Valid URL slug
 */
export function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

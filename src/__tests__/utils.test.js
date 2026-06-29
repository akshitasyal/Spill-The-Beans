import { describe, it, expect } from 'vitest';
import { formatPrice, truncateText, generateSlug } from '../lib/utils';

describe('Frontend Utility Functions', () => {
  describe('formatPrice', () => {
    it('should format raw paise into Indian Rupees correctly', () => {
      expect(formatPrice(49900).replace(/\s/g, '')).toContain('₹499.00');
      expect(formatPrice(0).replace(/\s/g, '')).toContain('₹0.00');
      expect(formatPrice(124950).replace(/\s/g, '')).toContain('₹1,249.50');
    });

    it('should return ₹0.00 for invalid inputs', () => {
      expect(formatPrice(null)).toBe('₹0.00');
      expect(formatPrice(undefined)).toBe('₹0.00');
      expect(formatPrice('abc')).toBe('₹0.00');
    });
  });

  describe('truncateText', () => {
    it('should truncate text that exceeds the limit', () => {
      const text = 'Spill The Beans is a premium soluble coffee brand.';
      expect(truncateText(text, 15)).toBe('Spill The Beans...');
    });

    it('should not truncate text within the limit', () => {
      const text = 'Spill The Beans';
      expect(truncateText(text, 50)).toBe('Spill The Beans');
    });
  });

  describe('generateSlug', () => {
    it('should convert titles to lowercase, hyphenated strings', () => {
      expect(generateSlug('Hazelnut Bliss Instant Coffee')).toBe('hazelnut-bliss-instant-coffee');
      expect(generateSlug('Araku Valley: Single Origin! 100g')).toBe('araku-valley-single-origin-100g');
    });

    it('should return empty string for empty inputs', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug(null)).toBe('');
    });
  });
});

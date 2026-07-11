/**
 * Additional tests for checkout validation logic
 * Tests the card validation utilities used in CheckoutScreen
 */
import {
  isValidLuhn,
  detectCardBrand,
  formatCardNumber,
  isValidExpDate,
  isValidCVC,
  isValidCardHolder,
} from '../../src/utils/cardValidation';

describe('Checkout Card Validation Integration', () => {
  describe('Full card validation flow', () => {
    it('should validate a complete Visa card', () => {
      const number = '4242424242424242';
      const formatted = formatCardNumber(number);
      expect(formatted).toBe('4242 4242 4242 4242');
      expect(isValidLuhn(number)).toBe(true);
      expect(detectCardBrand(number)).toBe('visa');
      expect(isValidExpDate('12', '30')).toBe(true);
      expect(isValidCVC('123')).toBe(true);
      expect(isValidCardHolder('Test User')).toBe(true);
    });

    it('should validate a complete Mastercard', () => {
      const number = '5500000000000004';
      expect(isValidLuhn(number)).toBe(true);
      expect(detectCardBrand(number)).toBe('mastercard');
    });

    it('should reject incomplete card data', () => {
      expect(isValidLuhn('424242')).toBe(false);
      expect(isValidCVC('12')).toBe(false);
      expect(isValidCardHolder('')).toBe(false);
      expect(isValidExpDate('13', '30')).toBe(false);
    });

    it('should handle edge cases for expiration', () => {
      expect(isValidExpDate('01', '99')).toBe(true);
      expect(isValidExpDate('12', '25')).toBe(false); // past
    });

    it('should format various card number lengths', () => {
      expect(formatCardNumber('4242')).toBe('4242');
      expect(formatCardNumber('42424242')).toBe('4242 4242');
      expect(formatCardNumber('424242424242')).toBe('4242 4242 4242');
    });

    it('should detect unknown brand', () => {
      expect(detectCardBrand('9999999999999999')).toBe('unknown');
      expect(detectCardBrand('3')).toBe('unknown');
    });

    it('should handle Mastercard 2xxx range', () => {
      expect(detectCardBrand('2221000000000000')).toBe('mastercard');
      expect(detectCardBrand('2720000000000000')).toBe('mastercard');
    });
  });
});

import {
  isValidLuhn,
  detectCardBrand,
  formatCardNumber,
  isValidExpDate,
  isValidCVC,
  isValidCardHolder,
} from '../../src/utils/cardValidation';

describe('cardValidation', () => {
  describe('isValidLuhn', () => {
    it('should return true for valid Visa number', () => {
      expect(isValidLuhn('4242424242424242')).toBe(true);
    });

    it('should return true for valid Mastercard number', () => {
      expect(isValidLuhn('5500000000000004')).toBe(true);
    });

    it('should return false for invalid number', () => {
      expect(isValidLuhn('1234567890123456')).toBe(false);
    });

    it('should return false for number with letters', () => {
      expect(isValidLuhn('4242abcd42424242')).toBe(false);
    });

    it('should return false for too short number', () => {
      expect(isValidLuhn('424242')).toBe(false);
    });

    it('should return false for too long number', () => {
      expect(isValidLuhn('42424242424242424242')).toBe(false);
    });

    it('should handle numbers with spaces', () => {
      expect(isValidLuhn('4242 4242 4242 4242')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidLuhn('')).toBe(false);
    });
  });

  describe('detectCardBrand', () => {
    it('should detect Visa (starts with 4)', () => {
      expect(detectCardBrand('4242424242424242')).toBe('visa');
    });

    it('should detect Mastercard (starts with 51-55)', () => {
      expect(detectCardBrand('5500000000000004')).toBe('mastercard');
    });

    it('should detect Mastercard (starts with 22)', () => {
      expect(detectCardBrand('2221000000000000')).toBe('mastercard');
    });

    it('should return unknown for other numbers', () => {
      expect(detectCardBrand('6011000000000000')).toBe('unknown');
    });

    it('should handle numbers with spaces', () => {
      expect(detectCardBrand('4242 4242')).toBe('visa');
    });
  });

  describe('formatCardNumber', () => {
    it('should format with spaces every 4 digits', () => {
      expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    });

    it('should remove non-digit characters', () => {
      expect(formatCardNumber('4242-4242')).toBe('4242 4242');
    });

    it('should truncate to 16 digits', () => {
      expect(formatCardNumber('42424242424242421234')).toBe(
        '4242 4242 4242 4242',
      );
    });

    it('should handle partial input', () => {
      expect(formatCardNumber('424')).toBe('424');
    });

    it('should handle empty string', () => {
      expect(formatCardNumber('')).toBe('');
    });
  });

  describe('isValidExpDate', () => {
    it('should return true for future date', () => {
      expect(isValidExpDate('12', '30')).toBe(true);
    });

    it('should return false for past date', () => {
      expect(isValidExpDate('01', '20')).toBe(false);
    });

    it('should return false for invalid month (0)', () => {
      expect(isValidExpDate('00', '30')).toBe(false);
    });

    it('should return false for invalid month (13)', () => {
      expect(isValidExpDate('13', '30')).toBe(false);
    });

    it('should return false for non-numeric input', () => {
      expect(isValidExpDate('ab', '30')).toBe(false);
    });

    it('should return false for non-numeric year', () => {
      expect(isValidExpDate('12', 'ab')).toBe(false);
    });
  });

  describe('isValidCVC', () => {
    it('should return true for 3 digit CVC', () => {
      expect(isValidCVC('123')).toBe(true);
    });

    it('should return true for 4 digit CVC (Amex)', () => {
      expect(isValidCVC('1234')).toBe(true);
    });

    it('should return false for 2 digit CVC', () => {
      expect(isValidCVC('12')).toBe(false);
    });

    it('should return false for 5 digit CVC', () => {
      expect(isValidCVC('12345')).toBe(false);
    });

    it('should return false for letters', () => {
      expect(isValidCVC('abc')).toBe(false);
    });
  });

  describe('isValidCardHolder', () => {
    it('should return true for valid name', () => {
      expect(isValidCardHolder('John Doe')).toBe(true);
    });

    it('should return false for short name', () => {
      expect(isValidCardHolder('Jo')).toBe(false);
    });

    it('should return false for empty name', () => {
      expect(isValidCardHolder('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(isValidCardHolder('   ')).toBe(false);
    });
  });
});

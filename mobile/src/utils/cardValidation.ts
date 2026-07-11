import {CardBrand} from '../types';

/**
 * Luhn algorithm to validate credit card numbers
 */
export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(digits) || digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Detect card brand from card number
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const cleaned = cardNumber.replace(/\s/g, '');

  // Visa: starts with 4
  if (/^4/.test(cleaned)) {
    return 'visa';
  }

  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return 'mastercard';
  }

  return 'unknown';
}

/**
 * Format card number with spaces every 4 digits
 */
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').substring(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

/**
 * Validate expiration date
 */
export function isValidExpDate(month: string, year: string): boolean {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(m) || isNaN(y)) {
    return false;
  }
  if (m < 1 || m > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (y < currentYear || (y === currentYear && m < currentMonth)) {
    return false;
  }

  return true;
}

/**
 * Validate CVC (3 or 4 digits)
 */
export function isValidCVC(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}

/**
 * Validate card holder name
 */
export function isValidCardHolder(name: string): boolean {
  return name.trim().length >= 3;
}

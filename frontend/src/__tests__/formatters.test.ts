import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatTime, formatRelative, isValidDate } from '../utils/formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toContain('2024');
    });

    it('handles string date input', () => {
      expect(formatDate('2024-01-15')).toBeDefined();
    });

    it('returns dash for null input', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('returns dash for undefined input', () => {
      expect(formatDate(undefined)).toBe('-');
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTime(date);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('returns dash for null input', () => {
      expect(formatDateTime(null)).toBe('-');
    });
  });

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const date = new Date('2024-01-15T10:30:45Z');
      const result = formatTime(date);
      expect(result).toBeDefined();
    });

    it('returns dash for null input', () => {
      expect(formatTime(null)).toBe('-');
    });
  });

  describe('formatRelative', () => {
    it('returns relative time string', () => {
      const result = formatRelative('2024-01-15');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid date', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
    });

    it('returns false for null input', () => {
      expect(isValidDate(null)).toBe(false);
    });

    it('returns false for undefined input', () => {
      expect(isValidDate(undefined)).toBe(false);
    });
  });
});

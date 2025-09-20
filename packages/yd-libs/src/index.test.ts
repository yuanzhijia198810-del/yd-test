import { describe, expect, it } from 'vitest';
import { Logger, calculateAverage } from './index';

describe('calculateAverage', () => {
  it('computes the average with default precision', () => {
    expect(calculateAverage([1, 2, 3])).toBe(2);
  });

  it('respects the provided precision', () => {
    expect(calculateAverage([1, 2], { precision: 1 })).toBe(1.5);
  });

  it('throws when called without values', () => {
    expect(() => calculateAverage([])).toThrow(/at least one value/);
  });
});

describe('Logger', () => {
  it('does not throw when logging at different levels', () => {
    const logger = new Logger({ level: 'debug', prefix: 'test' });
    expect(() => {
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
    }).not.toThrow();
  });
});

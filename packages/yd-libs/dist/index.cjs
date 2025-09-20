'use strict';

const LEVEL_PRIORITY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  constructor(options = {}) {
    this.level = options.level ?? 'info';
    this.prefix = options.prefix;
  }

  shouldLog(level) {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.level];
  }

  formatMessage(message) {
    const base = typeof message === 'string' ? message : JSON.stringify(message);
    return this.prefix ? `[${this.prefix}] ${base}` : base;
  }

  debug(message) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage(message));
    }
  }

  info(message) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(message));
    }
  }

  warn(message) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message));
    }
  }

  error(message) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message));
    }
  }
}

function calculateAverage(values, options = {}) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('calculateAverage requires at least one value');
  }

  const precision = options.precision ?? 2;
  const sum = values.reduce((acc, value) => acc + value, 0);
  const average = sum / values.length;
  const factor = 10 ** precision;
  return Math.round(average * factor) / factor;
}

exports.Logger = Logger;
exports.calculateAverage = calculateAverage;

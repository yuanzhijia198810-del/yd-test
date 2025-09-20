export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private readonly level: LogLevel;
  private readonly prefix?: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
    this.prefix = options.prefix;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.level];
  }

  private formatMessage(message: unknown): string {
    const base = typeof message === 'string' ? message : JSON.stringify(message);
    return this.prefix ? `[${this.prefix}] ${base}` : base;
  }

  debug(message: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage(message));
    }
  }

  info(message: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(message));
    }
  }

  warn(message: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message));
    }
  }

  error(message: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message));
    }
  }
}

export interface AverageOptions {
  precision?: number;
}

export function calculateAverage(values: number[], options: AverageOptions = {}): number {
  if (values.length === 0) {
    throw new Error('calculateAverage requires at least one value');
  }

  const { precision = 2 } = options;
  const sum = values.reduce((acc, value) => acc + value, 0);
  const average = sum / values.length;
  const factor = 10 ** precision;
  return Math.round(average * factor) / factor;
}

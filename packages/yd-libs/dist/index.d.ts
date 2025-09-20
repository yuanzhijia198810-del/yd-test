export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}

export declare class Logger {
  constructor(options?: LoggerOptions);
  debug(message: unknown): void;
  info(message: unknown): void;
  warn(message: unknown): void;
  error(message: unknown): void;
}

export interface AverageOptions {
  precision?: number;
}

export declare function calculateAverage(values: number[], options?: AverageOptions): number;

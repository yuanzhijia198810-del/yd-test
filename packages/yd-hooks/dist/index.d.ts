import type { AverageOptions, LogLevel, Logger, LoggerOptions } from 'yd-libs';

export interface UseLoggerOptions extends LoggerOptions {
  dependencies?: ReadonlyArray<unknown>;
}

export declare function useLogger(options?: UseLoggerOptions): Logger;

export interface UseAverageOptions extends AverageOptions {
  logger?: Logger;
  logLevel?: LogLevel;
}

export declare function useAverage(values: number[], options?: UseAverageOptions): number;

import { useEffect, useMemo } from 'react';
import type { AverageOptions, LogLevel, LoggerOptions } from 'yd-libs';
import { Logger, calculateAverage } from 'yd-libs';

export interface UseLoggerOptions extends LoggerOptions {
  /**
   * Optional dependencies that should recreate the logger instance when they change.
   */
  dependencies?: ReadonlyArray<unknown>;
}

export function useLogger(options: UseLoggerOptions = {}): Logger {
  const { dependencies = [], ...loggerOptions } = options;
  return useMemo(
    () => new Logger(loggerOptions),
    [loggerOptions.level, loggerOptions.prefix, ...dependencies],
  );
}

export interface UseAverageOptions extends AverageOptions {
  /**
   * Whether to log the calculated average through the provided logger instance.
   */
  logger?: Logger;
  /**
   * Optional level to log the calculated average.
   */
  logLevel?: LogLevel;
}

function logWithLevel(logger: Logger, level: LogLevel, message: string): void {
  switch (level) {
    case 'debug':
      logger.debug(message);
      break;
    case 'info':
      logger.info(message);
      break;
    case 'warn':
      logger.warn(message);
      break;
    case 'error':
      logger.error(message);
      break;
    default:
      logger.info(message);
  }
}

export function useAverage(values: number[], options: UseAverageOptions = {}): number {
  const { logger, logLevel = 'info', ...averageOptions } = options;

  const average = useMemo(() => {
    return calculateAverage(values, averageOptions);
  }, [values, averageOptions.precision]);

  useEffect(() => {
    if (logger) {
      logWithLevel(logger, logLevel, `Average: ${average}`);
    }
  }, [logger, logLevel, average]);

  return average;
}

import { useEffect, useMemo } from 'react';
import { Logger, calculateAverage } from 'yd-libs';

function useLogger(options = {}) {
  const { dependencies = [], ...loggerOptions } = options;
  return useMemo(
    () => new Logger(loggerOptions),
    [loggerOptions.level, loggerOptions.prefix, ...dependencies],
  );
}

function logWithLevel(logger, level, message) {
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

function useAverage(values, options = {}) {
  const { logger, logLevel = 'info', ...averageOptions } = options;

  const average = useMemo(() => calculateAverage(values, averageOptions), [
    values,
    averageOptions.precision,
  ]);

  useEffect(() => {
    if (logger) {
      logWithLevel(logger, logLevel, `Average: ${average}`);
    }
  }, [logger, logLevel, average]);

  return average;
}

export { useAverage, useLogger };

'use strict';

const react = require('react');
const ydLibs = require('yd-libs');

function useLogger(options = {}) {
  const { dependencies = [], ...loggerOptions } = options;
  return react.useMemo(
    () => new ydLibs.Logger(loggerOptions),
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

  const average = react.useMemo(() => ydLibs.calculateAverage(values, averageOptions), [
    values,
    averageOptions.precision,
  ]);

  react.useEffect(() => {
    if (logger) {
      logWithLevel(logger, logLevel, `Average: ${average}`);
    }
  }, [logger, logLevel, average]);

  return average;
}

exports.useAverage = useAverage;
exports.useLogger = useLogger;

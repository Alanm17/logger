import pino, { Logger as PinoLogger } from 'pino';
import { getContext } from './context';
import type { LogLevel, LogFields, LoggerOptions, Logger } from './types';

const VALID_LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug'];

function isValidLevel(value: string): value is LogLevel {
  return (VALID_LEVELS as string[]).includes(value);
}

/**
 * Create a logger for a given service. Every log line always includes:
 * timestamp, level, service, message, and (if present) requestId / traceId /
 * spanId pulled automatically from the active request context.
 */
export function createLogger(serviceName: string, options: LoggerOptions = {}): Logger {
  if (!serviceName) {
    throw new Error('createLogger requires a serviceName, e.g. createLogger("checkout-service")');
  }

  const envLevel = process.env.LOG_LEVEL;
  const level = options.level ?? (envLevel && isValidLevel(envLevel) ? envLevel : 'info');

  if (!isValidLevel(level)) {
    throw new Error(`Invalid log level "${level}". Must be one of: ${VALID_LEVELS.join(', ')}`);
  }

  const base: PinoLogger = pino({
    level,
    base: { service: serviceName },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    redact: {
      paths: ['password', 'token', 'authorization', 'apiKey', 'secret'],
      censor: '[REDACTED]',
    },
  });

  function log(level: LogLevel, message: string, fields: LogFields = {}): void {
    const context = getContext();
    base[level]({ ...context, ...fields }, message);
  }

  return {
    error: (message, fields) => log('error', message, fields),
    warn: (message, fields) => log('warn', message, fields),
    info: (message, fields) => log('info', message, fields),
    debug: (message, fields) => log('debug', message, fields),
  };
}

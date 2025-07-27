/**
 * Debug utilities for development logging with production safety
 */

interface LogContext {
  [key: string]: unknown;
}

const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

/**
 * Centralized debug logger that only logs in development
 */
export const debugLogger = {
  debug: (message: string, context?: LogContext): void => {
    if (DEBUG_ENABLED) {
      console.log(`🐛 ${message}`, context ? context : '');
    }
  },

  info: (message: string, context?: LogContext): void => {
    if (DEBUG_ENABLED) {
      console.info(`ℹ️ ${message}`, context ? context : '');
    }
  },

  warn: (message: string, context?: LogContext): void => {
    if (DEBUG_ENABLED) {
      console.warn(`⚠️ ${message}`, context ? context : '');
    }
  },

  error: (
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): void => {
    // Always log errors, even in production (but sanitized)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ ${message}`, errorMessage);

    if (DEBUG_ENABLED && context) {
      console.error('Error context:', context);
    }
  },

  transfer: (phase: string, details?: LogContext): void => {
    if (DEBUG_ENABLED) {
      console.log(`🔄 Transfer ${phase}`, details ? details : '');
    }
  },

  progress: (jobId: string, progress: number, total: number): void => {
    if (DEBUG_ENABLED) {
      console.log(
        `📊 Job ${jobId}: ${progress}/${total} (${Math.round((progress / total) * 100)}%)`
      );
    }
  },
};

/**
 * Performance measurement utility
 */
export const performanceLogger = {
  time: (label: string): void => {
    if (DEBUG_ENABLED) {
      console.time(`⏱️ ${label}`);
    }
  },

  timeEnd: (label: string): void => {
    if (DEBUG_ENABLED) {
      console.timeEnd(`⏱️ ${label}`);
    }
  },
};

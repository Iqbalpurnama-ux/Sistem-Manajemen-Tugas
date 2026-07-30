/**
 * Simple structured logger for standardizing log output.
 * In the future, this can easily be replaced by Winston or Pino, 
 * or pipe directly into a service like Datadog/Sentry.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export const logger = {
  log: (level: LogLevel, message: string, meta?: any) => {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta })
    }
    
    // In production, we output JSON stringified logs for structured parsing
    if (process.env.NODE_ENV === 'production') {
      console[level === 'debug' ? 'log' : level](JSON.stringify(logEntry))
    } else {
      // In development, pretty print
      const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m'
      const reset = '\x1b[0m'
      console[level === 'debug' ? 'log' : level](`${color}[${level.toUpperCase()}] ${timestamp}${reset}: ${message}`, meta ? meta : '')
    }
  },
  
  info: (message: string, meta?: any) => logger.log('info', message, meta),
  warn: (message: string, meta?: any) => logger.log('warn', message, meta),
  error: (message: string, meta?: any) => logger.log('error', message, meta),
  debug: (message: string, meta?: any) => logger.log('debug', message, meta),
}

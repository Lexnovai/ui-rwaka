const DEBUG_ENABLED = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true'

export const debug = {
  log: (...args: unknown[]) => {
    if (DEBUG_ENABLED) {
      console.log('[DEBUG]', ...args)
    }
  },
  
  error: (...args: unknown[]) => {
    if (DEBUG_ENABLED) {
      console.error('[DEBUG ERROR]', ...args)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (DEBUG_ENABLED) {
      console.warn('[DEBUG WARN]', ...args)
    }
  },
  
  info: (...args: unknown[]) => {
    if (DEBUG_ENABLED) {
      console.info('[DEBUG INFO]', ...args)
    }
  }
}

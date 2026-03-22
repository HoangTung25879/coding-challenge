// src/lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: (import.meta.env?.VITE_LOG_LEVEL as string) ?? 'info',
  browser: {
    asObject: true,
  },
})

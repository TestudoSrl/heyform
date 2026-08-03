import { CORS_ALLOWED_ORIGINS } from '@environments'

type CorsOriginCallback = (err: Error | null, allow?: boolean) => void

export function normalizeCorsOrigin(origin?: string): string | undefined {
  const value = origin?.trim()

  if (!value) {
    return
  }

  try {
    return new URL(value).origin
  } catch (_) {
    return
  }
}

export function normalizeCorsAllowedOrigins(origins: string[]): string[] {
  return Array.from(new Set(origins.map(normalizeCorsOrigin).filter(Boolean) as string[]))
}

export function isCorsOriginAllowed(
  origin: string | undefined,
  allowedOrigins = CORS_ALLOWED_ORIGINS
): boolean {
  const requestOrigin = normalizeCorsOrigin(origin)

  if (!requestOrigin) {
    return false
  }

  return normalizeCorsAllowedOrigins(allowedOrigins).includes(requestOrigin)
}

export function createCorsOriginChecker(allowedOrigins = CORS_ALLOWED_ORIGINS) {
  const normalizedAllowedOrigins = new Set(normalizeCorsAllowedOrigins(allowedOrigins))

  return (origin: string | undefined, callback: CorsOriginCallback): void => {
    const requestOrigin = normalizeCorsOrigin(origin)

    callback(null, requestOrigin ? normalizedAllowedOrigins.has(requestOrigin) : false)
  }
}

export const corsOrigin = createCorsOriginChecker()

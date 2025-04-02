import { PriceData, PriceResponse, ErrorResponse, ErrorCode } from '../types';

/**
 * Formats a successful price response
 */
export function formatPriceResponse(prices: PriceData[]): PriceResponse {
  const now = new Date().toISOString();
  
  // Determine cache status
  let cacheStatus: 'fresh' | 'stale' | 'mixed' = 'fresh';
  
  if (prices.length > 0) {
    const hasStale = prices.some(price => price.isStale);
    const hasFresh = prices.some(price => !price.isStale);
    
    if (hasStale && hasFresh) {
      cacheStatus = 'mixed';
    } else if (hasStale) {
      cacheStatus = 'stale';
    }
  }
  
  return {
    data: {
      prices,
      meta: {
        timestamp: now,
        cacheStatus,
      },
    },
  };
}

/**
 * Formats an error response
 */
export function formatErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, string | number | boolean | null | string[]>
): ErrorResponse {
  return {
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Formats a token not found error
 */
export function formatTokenNotFoundError(notFoundTokens: string[]): ErrorResponse {
  return formatErrorResponse(
    ErrorCode.TOKEN_NOT_FOUND,
    'One or more tokens not found',
    { notFound: notFoundTokens }
  );
}

/**
 * Formats an invalid source error
 */
export function formatInvalidSourceError(invalidSources: string[]): ErrorResponse {
  return formatErrorResponse(
    ErrorCode.INVALID_SOURCE,
    'One or more specified sources are invalid',
    { invalidSources }
  );
}

/**
 * Formats a rate limited error
 */
export function formatRateLimitedError(): ErrorResponse {
  return formatErrorResponse(
    ErrorCode.RATE_LIMITED,
    'Rate limit exceeded for the API'
  );
}

/**
 * Formats an internal error
 */
export function formatInternalError(message: string = 'An unexpected server error occurred'): ErrorResponse {
  return formatErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    message
  );
}

/**
 * Formats an invalid request error
 */
export function formatInvalidRequestError(message: string = 'Request parameters are invalid or malformed'): ErrorResponse {
  return formatErrorResponse(
    ErrorCode.INVALID_REQUEST,
    message
  );
} 
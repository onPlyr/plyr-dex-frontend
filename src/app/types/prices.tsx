export type TokenIdentifier = string; // Format: "service:id" or "chainId:address"

export interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  address?: string;
  chainId?: number;
}

export interface PriceData {
  id: string;
  token?: TokenInfo;
  price: string;
  currency: string;
  timestamp: string;
  isStale: boolean;
  source: string;
}

export interface PriceResponse {
  data: {
    prices: PriceData[];
    meta: {
      timestamp: string;
      cacheStatus: 'fresh' | 'stale' | 'mixed';
    };
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string | number | boolean | null | string[]>;
  };
}

export interface PriceSourceAdapter {
  getPrice(tokenIds: string[], currency: string): Promise<PriceData[]>;
  getName(): string;
  getPriority(): number;
}

export interface CacheEntry {
  data: PriceData;
  timestamp: number;
  expiresAt: number;
}

export type TokenResolutionResult = {
  resolvedToken: TokenInfo;
  sourceSpecificId?: string;
  service?: string;
};

export type PriceRequestParams = {
  tokens: string[];
  sources?: string[];
  currency?: string;
};

export enum ErrorCode {
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  INVALID_SOURCE = 'INVALID_SOURCE',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
} 
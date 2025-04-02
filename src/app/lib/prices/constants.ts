// Cache configuration
export const CACHE_TTL_MS = 60 * 1000; // 1 minute (stale data threshold)
export const CACHE_MAX_SIZE = 1000; // Maximum number of items in cache

// Supported price sources with their priorities (lower number = higher priority)
export const PRICE_SOURCES = {
  CHAINLINK: {
    name: 'Chainlink',
    priority: 1,
  },
  DEXSCREENER: {
    name: 'DexScreener',
    priority: 2,
  },
  COINGECKO: {
    name: 'CoinGecko',
    priority: 3,
  },
  COINMARKETCAP: {
    name: 'CoinMarketCap',
    priority: 4,
  },
};

// Default currency
export const DEFAULT_CURRENCY = 'USD';

// Source timeout configuration
export const SOURCE_TIMEOUT_MS = 3000; // 3 seconds
export const SOURCE_FAILURE_THRESHOLD = 3;
export const SOURCE_RECOVERY_THRESHOLD = 2;
export const SOURCE_BACKOFF_MS = 60000; // 1 minute

// Token mapping for tesseract internal IDs
export const TESSERACT_TOKEN_MAPPING: Record<string, { symbol: string; name: string; address?: string; chainId?: number }> = {
  // Ethereum tokens
  'btc': {
    symbol: 'BTC',
    name: 'Bitcoin',
  },
  'eth': {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chainId: 1,
  },
  'usdc': {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId: 1,
  },
  'usdt': {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chainId: 1,
  },
  'dai': {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chainId: 1,
  },
  
  // Avalanche tokens
  'avax': {
    symbol: 'AVAX',
    name: 'Avalanche',
    address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX address
    chainId: 43114,
  },
  'eth.avax': {
    symbol: 'ETH',
    name: 'Ethereum (Avalanche)',
    address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // ETH on Avalanche
    chainId: 43114,
  },
  'btc.avax': {
    symbol: 'BTC',
    name: 'Bitcoin (Avalanche)',
    address: '0x152b9d0FdC40C096757F570A51E494bd4b943E50', // BTC.b on Avalanche
    chainId: 43114,
  },
  'usdc.avax': {
    symbol: 'USDC',
    name: 'USD Coin (Avalanche)',
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC on Avalanche
    chainId: 43114,
  },
  'usdt.avax': {
    symbol: 'USDT',
    name: 'Tether USD (Avalanche)',
    address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT on Avalanche
    chainId: 43114,
  },
  'dai.avax': {
    symbol: 'DAI',
    name: 'Dai Stablecoin (Avalanche)',
    address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', // DAI on Avalanche
    chainId: 43114,
  },
  'link.avax': {
    symbol: 'LINK',
    name: 'Chainlink (Avalanche)',
    address: '0x5947BB275c521040051D82396192181b413227A3', // LINK on Avalanche
    chainId: 43114,
  },
  'coq': {
    symbol: 'COQ',
    name: 'COQ Inu',
    address: "0x420FcA0121DC28039145009570975747295f2329",
    chainId: 43114,
  },
  'dexalot-usdc': {
    symbol: 'USDC',
    name: 'Dexalot USDC',
    address: '0x68B773B8C10F2ACE8aC51980A1548B6B48a2eC54',
    chainId: 43113,
  },
  'dexalot-btcb': {
    symbol: 'BTC.b',
    name: 'Dexalot BTC.b',
    address: '0x5AAD791Bafde4fC3f2B60195b8C51820087Ff6FF',
    chainId: 43113,
  },
  'dexalot-usdt': {
    symbol: 'USDt',
    name: 'Dexalot USDt',
    address: '0x24236E8319504A663431EF23F810b6Fa723859c4',
    chainId: 43113,
  },
  'alot': {
    symbol: 'ALOT',
    name: 'Dexalot',
    address: "0x093783055F9047C2BfF99c4e414501F8A147bC69",
    chainId: 43114,
  }
}; 
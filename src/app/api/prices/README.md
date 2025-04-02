# Prices API Reference

The `/prices` API provides token pricing information from multiple sources, with intelligent caching and update mechanisms to prevent rate limiting and optimize resource usage.

### Base URL

```
https://dev.tesseract.finance
```

### Endpoint

```
GET /api/prices
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `tokens` | string[] | Yes | Token identifiers in either service:id or chainId:address format | `tesseract:btc,tesseract:eth,1:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| `sources` | string[] | No | Specific price sources to query (default: all) | `coingecko,chainlink` |
| `currency` | string | No | Currency for price display (default: USD) | `USD` |

## Token Identification

The API supports two formats for token identification:

1. **Service-prefixed IDs**
   - Format: `<service>:<id>`
   - Examples: `tesseract:btc`, `tesseract:eth`

2. **Chain-specific token addresses**
   - Format: `<chainId>:<address>`
   - Example: `1:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (USDC on Ethereum)

## Examples

### Example 1: Get prices for multiple tokens

#### Request

```http
GET /api/prices?tokens=tesseract:btc,tesseract:eth,tesseract:usdc
```

#### Response

```json
{
  "data": {
    "prices": [
      {
        "token": {
          "id": "tesseract:btc",
          "symbol": "BTC",
          "name": "Bitcoin"
        },
        "price": "83613.74",
        "currency": "USD",
        "timestamp": "2025-03-19T12:25:23.000Z",
        "isStale": false,
        "source": {
          "name": "Chainlink",
          "priority": 1
        }
      },
      {
        "token": {
          "id": "tesseract:eth",
          "symbol": "ETH",
          "name": "Ethereum",
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "chainId": 1
        },
        "price": "2010.0268",
        "currency": "USD",
        "timestamp": "2025-03-19T12:25:23.000Z",
        "isStale": false,
        "source": {
          "name": "Chainlink",
          "priority": 1
        }
      },
      {
        "token": {
          "id": "tesseract:usdc",
          "symbol": "USDC",
          "name": "USD Coin",
          "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "chainId": 1
        },
        "price": "0.99992711",
        "currency": "USD",
        "timestamp": "2025-03-19T08:01:35.000Z",
        "isStale": false,
        "source": {
          "name": "Chainlink",
          "priority": 1
        }
      }
    ],
    "meta": {
      "timestamp": "2025-03-19T12:26:19.920Z",
      "cacheStatus": "fresh"
    }
  }
}
```

### Example 2: Get price for a specific token with specified source

#### Request

```http
GET /api/prices?tokens=1:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&sources=chainlink
```

#### Response

```json
{
  "data": {
    "prices": [
      {
        "token": {
          "id": "1:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "symbol": "USDC",
          "name": "USD Coin",
          "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "chainId": 1
        },
        "price": "0.99992711",
        "currency": "USD",
        "timestamp": "2025-03-19T08:01:35.000Z",
        "isStale": false,
        "source": {
          "name": "Chainlink",
          "priority": 1
        }
      }
    ],
    "meta": {
      "timestamp": "2025-03-19T12:26:28.563Z",
      "cacheStatus": "fresh"
    }
  }
}
```

## Response Schema

### Success Response

| Field | Type | Description |
|-------|------|-------------|
| `data.prices` | array | List of price objects for requested tokens |
| `data.prices[].token` | object | Token information |
| `data.prices[].token.id` | string | Token identifier used in request |
| `data.prices[].token.symbol` | string | Token symbol (e.g., BTC, ETH) |
| `data.prices[].token.name` | string | Full token name |
| `data.prices[].token.address` | string | Token contract address (if applicable) |
| `data.prices[].token.chainId` | number | Chain ID where token exists (if applicable) |
| `data.prices[].price` | string | Current token price |
| `data.prices[].currency` | string | Price currency (e.g., USD) |
| `data.prices[].timestamp` | string | ISO timestamp of when price data was last updated by source |
| `data.prices[].isStale` | boolean | Indicates if cached price data is considered stale (older than 1 minute) |
| `data.prices[].source` | object | Information about the price source |
| `data.prices[].source.name` | string | Name of the price source |
| `data.prices[].source.priority` | number | Source priority ranking (lower is better) |
| `data.meta.timestamp` | string | ISO timestamp of the API response |
| `data.meta.cacheStatus` | string | Status of cached data ("fresh", "stale", or "mixed") |

### Error Response Schema

All error responses follow a standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error-specific information
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `error.code` | string | Error code identifier |
| `error.message` | string | Human-readable error message |
| `error.details` | object | Additional error-specific details |

### Error Response Examples

#### TOKEN_NOT_FOUND Error

```json
{
  "error": {
    "code": "TOKEN_NOT_FOUND",
    "message": "One or more tokens not found",
    "details": {
      "notFound": ["tesseract:invalidtoken"]
    }
  }
}
```

#### INVALID_SOURCE Error

```json
{
  "error": {
    "code": "INVALID_SOURCE",
    "message": "One or more specified sources are invalid",
    "details": {
      "invalidSources": ["unknown_source"]
    }
  }
}
```

#### RATE_LIMITED Error

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "details": {
      "retryAfter": 30
    }
  }
}
```

#### INVALID_REQUEST Error

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "errors": [
        {
          "param": "tokens",
          "message": "Parameter is required"
        }
      ]
    }
  }
}
```

## Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `TOKEN_NOT_FOUND` | 404 | One or more requested tokens were not found |
| `INVALID_SOURCE` | 400 | One or more specified sources are invalid |
| `RATE_LIMITED` | 429 | Rate limit exceeded for the API |
| `INTERNAL_ERROR` | 500 | An unexpected server error occurred |
| `INVALID_REQUEST` | 400 | Request parameters are invalid or malformed |

## Price Source Priority

When multiple sources are available, the API selects prices based on the following priority:
1. Chainlink Oracles
2. Liquid DEX pools (with volume weighting)
3. CoinGecko
4. CoinMarketCap
5. Other sources

## Rate Limits

| Plan | Rate Limit |
|------|------------|
| Free | 60 requests per minute |
| Pro  | 300 requests per minute |
| Enterprise | Custom limits |

## Implementation Architecture

The API follows a layered architecture:

1. **API Layer**: Handles HTTP requests, parameter parsing, and response formatting
2. **Service Layer**: Contains core business logic and manages caching strategy
3. **Adapter Layer**: Provides consistent interface to different price sources
4. **Utility Layer**: Contains shared helper functions and utilities 
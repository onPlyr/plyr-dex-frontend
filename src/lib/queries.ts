import { gql } from "@apollo/client";

export const GLOBAL_DATA_QUERY = gql`
  query {
    uniswapFactories(first: 1) {
      totalVolumeUSD
      totalLiquidityUSD
      pairCount
      txCount
    }
  }
`;

export const PAIR_DATA_QUERY = gql`
  query getPairData($pairAddress: ID!) {
    pair(id: $pairAddress) {
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      reserve0
      reserve1
      reserveUSD
      token0Price
      token1Price
      volumeUSD
      txCount
    }
  }
`;

export const TOKEN_DATA_QUERY = gql`
  query getTokenData($tokenAddress: ID!) {
    token(id: $tokenAddress) {
      id
      symbol
      name
      decimals
      totalSupply
      tradeVolume
      tradeVolumeUSD
      totalLiquidity
      derivedETH
    }
  }
`;

export const GLOBAL_CHART_QUERY = gql`
  query {
    uniswapDayDatas(first: 30, orderBy: date, orderDirection: desc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`;


import { gql } from "@apollo/client";
import { client } from "@/src/lib/apollo-client";

const FACTORY_QUERY = gql`
  query {
    uniswapFactories(first: 1) {
      untrackedVolumeUSD
      totalVolumeUSD
      totalLiquidityUSD
      pairCount
      txCount
    }
  }
`;

const TOP_PAIRS_TOKENS_QUERY = gql`
  query {
    pairs(first: 100, orderBy: reserveUSD, orderDirection: desc) {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      reserveUSD
    }
    tokens(first: 100, orderBy: untrackedVolumeUSD, orderDirection: desc) {
      id
      symbol
      name
      derivedETH
      untrackedVolumeUSD
      tradeVolumeUSD
    }
    bundle(id: "1") {
      ethPrice
    }
  }
`;

const LATEST_TRANSACTIONS_QUERY = gql`
  query {
    swaps(first: 20, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
      transaction {
    	  id
        }
    }
    mints(first: 20, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amountUSD
      transaction {
    	  id
    	}
    }
    burns(first: 20, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amountUSD
      transaction {
    	  id
    	}
    }
  }
`;

const LATEST_TRANSACTIONS_BY_PAIR_ADDRESS_QUERY = gql`
  query getLatestTransactionsByPairAddress($pairAddress: ID) {
    swaps(first: 20, orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
      transaction {
    	  id
    	}
    }
    mints(first: 20, orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amountUSD
      transaction {
    	  id
    	}
    }
    burns(first: 20, orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amountUSD
      transaction {
    	  id
    	}
    }
  }
`;

const PAIR_DATA_QUERY = gql`
  query getPair($pairAddress: ID!) {
    pair(id: $pairAddress) {
      id
      token0 {
        id
        symbol
        name
        derivedETH
      }
      token1 {
        id
        symbol
        name
        derivedETH
      }
      reserve0
      reserve1
      reserveUSD
      trackedReserveETH
      untrackedVolumeUSD
      totalSupply
      volumeUSD
      txCount
    }
  }
`;

const TOKEN_DATA_QUERY = gql`
  query getToken($tokenAddress: ID!) {
    token(id: $tokenAddress) {
      id
      symbol
      name
      derivedETH
      untrackedVolumeUSD
      tradeVolumeUSD
      totalLiquidity
    }
    bundle(id: "1") {
      ethPrice
    }
  }
`;

const PAIR_TRANSACTIONS_QUERY = gql`
  query getPairTransactions($pairAddress: ID!) {
    swaps(first: 20, orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
      id
      timestamp
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
    }
  }
`;

const TOKEN_PAIRS_QUERY = gql`
  query getTokenPairs($tokenAddress: ID!) {
    pairs(first: 100, orderBy: reserveUSD, orderDirection: desc, where: { or: [{ token0: $tokenAddress }, { token1: $tokenAddress }] }) {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      reserveUSD
    }
  }
`;

const GLOBAL_CHART_QUERY = gql`
  query {
    uniswapDayDatas(first: 30, orderBy: date, orderDirection: desc) {
      date
      dailyVolumeUSD
      dailyVolumeUntracked
      totalLiquidityUSD
     
    }
  }
`;


const PAIR_LIQUIDITY_QUERY = gql`
  query getPairLiquidity($pairAddress: ID!) {
    pairDayDatas(first: 30, orderBy: date, orderDirection: desc, where: { pairAddress: $pairAddress }) {
      date
      reserveUSD
    }
  }
`;

const TOKEN_PRICE_QUERY = gql`
  query getTokenPrice($tokenAddress: ID!) {
    tokenDayDatas(first: 30, orderBy: date, orderDirection: desc, where: { token: $tokenAddress }) {
      date
      priceUSD
    }
  }
`;

export async function fetchFactoryData() {
    try {
        const { data } = await client.query({ query: FACTORY_QUERY });
        return data.uniswapFactories[0];
    } catch (error) {
        console.error("Error fetching factory data:", error);
        throw new Error("Failed to fetch factory data");
    }
}

export async function fetchTopPairsTokensData() {
    try {
        const { data } = await client.query({ query: TOP_PAIRS_TOKENS_QUERY });
        return { topPairs: data.pairs, topTokens: data.tokens, ethPrice: data.bundle.ethPrice };
    } catch (error) {
        console.error("Error fetching top pairs and tokens data:", error);
        throw new Error("Failed to fetch top pairs and tokens data");
    }
}

export async function fetchLatestTransactions() {
    try {
        const { data } = await client.query({
            query: LATEST_TRANSACTIONS_QUERY,
        });
        const allTransactions = [
            ...data.swaps.map((swap: any) => ({
                ...swap,
                type: 'swap',
                token0Id: swap.pair.token0.id,
                token1Id: swap.pair.token1.id,
                token0Symbol: swap.pair.token0.symbol,
                token1Symbol: swap.pair.token1.symbol,
                isToken0ToToken1: parseFloat(swap.amount0In) > 0,
            })),
            ...data.mints.map((mint: any) => ({
                ...mint,
                type: 'add',
                token0Id: mint.pair.token0.id,
                token1Id: mint.pair.token1.id,
                token0Symbol: mint.pair.token0.symbol,
                token1Symbol: mint.pair.token1.symbol,
            })),
            ...data.burns.map((burn: any) => ({
                ...burn,
                type: 'remove',
                token0Id: burn.pair.token0.id,
                token1Id: burn.pair.token1.id,
                token0Symbol: burn.pair.token0.symbol,
                token1Symbol: burn.pair.token1.symbol,
            })),
        ];
        return allTransactions.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)).slice(0, 20);
    } catch (error) {
        console.error("Error fetching latest transactions:", error);
        throw new Error("Failed to fetch latest transactions");
    }
}

export async function fetchLatestTransactionsByPairAddress(pairAddress: string | undefined) {
    try {
        const { data } = await client.query({
            query: LATEST_TRANSACTIONS_BY_PAIR_ADDRESS_QUERY,
            variables: { pairAddress }
        });

        console.log(data)

        const allTransactions = [
            ...data.swaps.map((swap: any) => ({
                ...swap,
                type: 'swap',
                token0Id: swap.pair.token0.id,
                token1Id: swap.pair.token1.id,
                token0Symbol: swap.pair.token0.symbol,
                token1Symbol: swap.pair.token1.symbol,
                isToken0ToToken1: parseFloat(swap.amount0In) > 0,
            })),
            ...data.mints.map((mint: any) => ({
                ...mint,
                type: 'add',
                token0Id: mint.pair.token0.id,
                token1Id: mint.pair.token1.id,
                token0Symbol: mint.pair.token0.symbol,
                token1Symbol: mint.pair.token1.symbol,
            })),
            ...data.burns.map((burn: any) => ({
                ...burn,
                type: 'remove',
                token0Id: burn.pair.token0.id,
                token1Id: burn.pair.token1.id,
                token0Symbol: burn.pair.token0.symbol,
                token1Symbol: burn.pair.token1.symbol,
            })),
        ];
        return allTransactions.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)).slice(0, 20);
    } catch (error) {
        console.error("Error fetching latest transactions:", error);
        throw new Error("Failed to fetch latest transactions");
    }
}

export async function fetchPairData(pairAddress: string) {
    try {
        const { data } = await client.query({
            query: PAIR_DATA_QUERY,
            variables: { pairAddress }
        })
        return data.pair
    } catch (error) {
        console.error("Error fetching pair data:", error)
        throw new Error("Failed to fetch pair data")
    }
}

export async function fetchPairTransactions(pairAddress: string) {
    try {
        const { data } = await client.query({
            query: PAIR_TRANSACTIONS_QUERY,
            variables: { pairAddress }
        })
        return processPairTransactions(data)
    } catch (error) {
        console.error("Error fetching pair transactions:", error)
        throw new Error("Failed to fetch pair transactions")
    }
}

export async function fetchTokenData(tokenAddress: string) {
    try {
        const { data } = await client.query({
            query: TOKEN_DATA_QUERY,
            variables: { tokenAddress }
        })
        return {token: data.token, ethPrice: data.bundle.ethPrice}
    } catch (error) {
        console.error("Error fetching token data:", error)
        throw new Error("Failed to fetch token data")
    }
}

export async function fetchTokenPairs(tokenAddress: string) {
    try {
        const { data } = await client.query({
            query: TOKEN_PAIRS_QUERY,
            variables: { tokenAddress }
        })
        return data.pairs
    } catch (error) {
        console.error("Error fetching token pairs:", error)
        throw new Error("Failed to fetch token pairs")
    }
}

export async function fetchGlobalChartData() {
    try {
        const { data } = await client.query({ query: GLOBAL_CHART_QUERY });
        return data.uniswapDayDatas;
    } catch (error) {
        console.error("Error fetching global chart data:", error);
        throw new Error("Failed to fetch global chart data");
    }
}

export async function fetchPairLiquidityData(pairAddress: string) {
    try {
      const { data } = await client.query({ 
        query: PAIR_LIQUIDITY_QUERY,
        variables: { pairAddress }
      });
      return data.pairDayDatas;
    } catch (error) {
      console.error("Error fetching pair liquidity data:", error);
      throw new Error("Failed to fetch pair liquidity data");
    }
  }
  
  export async function fetchTokenPriceData(tokenAddress: string) {
    try {
      const { data } = await client.query({ 
        query: TOKEN_PRICE_QUERY,
        variables: { tokenAddress }
      });
      return data.tokenDayDatas;
    } catch (error) {
      console.error("Error fetching token price data:", error);
      throw new Error("Failed to fetch token price data");
    }
  }

function processPairTransactions(data: any) {
    return data.swaps.map((swap: any) => ({
        ...swap,
        type: 'swap',
        token0Symbol: swap.pair.token0.symbol,
        token1Symbol: swap.pair.token1.symbol,
        isToken0ToToken1: parseFloat(swap.amount0In) > 0,
    }))
}


import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: "https://wan-subgraph.xyz/subgraphs/name/wanswap/wanswap-subgraph-3",
  cache: new InMemoryCache(),
});


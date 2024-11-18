import { defineChain } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const secretKey = process.env.THIRDWEB_SECRET_KEY;

export const client = createThirdwebClient(
  secretKey
    ? { secretKey }
    : {
      clientId,
    }
);

export const tauChain = defineChain({
  id: 62831,
  name: "PLYR TAU Testnet",
  rpc: "https://subnets.avax.network/plyr/testnet/rpc",
  icon: {
    url: "https://plyr.network/logo/plyr_icon_orange.svg",
    width: 48,
    height: 48,
    format: "svg",
  },
  nativeCurrency: {
    name: "PLYR",
    symbol: "PLYR",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Avax Explorers",
      url: "https://subnets-test.avax.network/plyr",
    }
  ],
  testnet: true,
})

export const phiChain = defineChain({
  id: 16180,
  name: "PLYR PHI",
  rpc: "https://subnets.avax.network/plyr/mainnet/rpc",
  icon: {
    url: "https://plyr.network/logo/plyr_icon_orange.svg",
    width: 48,
    height: 48,
    format: "svg",
  },
  nativeCurrency: {
    name: "PLYR",
    symbol: "PLYR",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Avax Explorers",
      url: "https://subnets.avax.network/plyr",
    }
  ],
  testnet: true,
})

export const wanchain = defineChain({
  id: 888,
  name: "Wanchain",
  rpc: "https://gwan-ssl.wandevs.org:56891",
  nativeCurrency: {
    name: "Wancoin",
    symbol: "WAN",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Wanchain Testnet Explorer",
      url: "https://www.wanscan.org",
    }
  ],
})

export const wanchainTestnet = defineChain({
  id: 999,
  name: "Wanchain Testnet",
  rpc: "https://gwan-ssl.wandevs.org:46891",
  nativeCurrency: {
    name: "Wancoin",
    symbol: "WAN",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Wanchain Testnet Explorer",
      url: "https://testnet.wanscan.org",
    }
  ],
  testnet: true,
})

// Supported Tokens //
export const supportedTokens = {
  16180: [
      {
          address: '0x413F1a8F0A2Bd9b6D31B2CA91c4aa7bC08266731',
          name: 'GAMR',
          symbol: 'GAMR',
          icon: 'https://plyr.network/icons/gamr.svg',
      },
  ],
  62831: [
      {
          address: '0xa875625fe8A955406523E52E485f351b92908ce1',
          name: 'GAMR',
          symbol: 'GAMR',
          icon: 'https://plyr.network/icons/gamr.svg',
      },
  ],
}
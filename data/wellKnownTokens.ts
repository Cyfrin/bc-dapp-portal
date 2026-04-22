import type { Token } from "../types";

export type WellKnownToken = Token & {
  mainnetAddress: string; // Ethereum mainnet address for CoinGecko price lookup
};

const ICONS = {
  WETH: "/img/eth.svg",
  DAI: "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png",
  UNI: "https://coin-images.coingecko.com/coins/images/12504/large/uniswap-logo.png",
  AAVE: "https://coin-images.coingecko.com/coins/images/12645/large/aave-token-round.png",
  COMP: "https://coin-images.coingecko.com/coins/images/10775/large/COMP.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/large/USDC.png",
  WBTC: "https://assets.coingecko.com/coins/images/7598/large/WBTCLOGO.png",
};

export const wellKnownTokens: Record<number, WellKnownToken[]> = {
  // Sepolia (chainId 11155111)
  11155111: [
    {
      address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      iconUrl: ICONS.WETH,
      mainnetAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    {
      address: "0x776b6fc2ed15d6bb5fc32e0c89de68683118c62a",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      iconUrl: ICONS.DAI,
      mainnetAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    {
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      symbol: "UNI",
      name: "Uniswap",
      decimals: 18,
      iconUrl: ICONS.UNI,
      mainnetAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    },
    {
      address: "0x5bB220Afc6E2e008CB2302a83536A019ED245AA2",
      symbol: "AAVE",
      name: "AAVE",
      decimals: 18,
      iconUrl: ICONS.AAVE,
      mainnetAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    },
    {
      address: "0xA6c8D1c55951e8AC44a0EaA959Be5Fd21cc07531",
      symbol: "COMP",
      name: "Compound",
      decimals: 18,
      iconUrl: ICONS.COMP,
      mainnetAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    },
    {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      symbol: "USDC",
      name: "USDC",
      decimals: 6,
      iconUrl: ICONS.USDC,
      mainnetAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    {
      address: "0x92f3B59a79bFf5dc60c0d59eA13a44D082B2bdFC",
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
      iconUrl: ICONS.WBTC,
      mainnetAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    },
  ],
  // Ethereum mainnet (chainId 1) — for when BattleChain mainnet launches
  1: [
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      iconUrl: ICONS.WETH,
      mainnetAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      iconUrl: ICONS.DAI,
      mainnetAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    {
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      symbol: "UNI",
      name: "Uniswap",
      decimals: 18,
      iconUrl: ICONS.UNI,
      mainnetAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    },
    {
      address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      symbol: "AAVE",
      name: "Aave Token",
      decimals: 18,
      iconUrl: ICONS.AAVE,
      mainnetAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    },
    {
      address: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
      symbol: "COMP",
      name: "Compound",
      decimals: 18,
      iconUrl: ICONS.COMP,
      mainnetAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      name: "USDC",
      decimals: 6,
      iconUrl: ICONS.USDC,
      mainnetAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    {
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
      iconUrl: ICONS.WBTC,
      mainnetAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    },
  ],
};

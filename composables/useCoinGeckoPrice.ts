import { $fetch } from "ofetch";

import { wellKnownTokens, type WellKnownToken } from "@/data/wellKnownTokens";

const COINGECKO_TOKEN_API = "https://api.coingecko.com/api/v3/simple/token_price/ethereum";
const COINGECKO_PRICE_API = "https://api.coingecko.com/api/v3/simple/price";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Addresses that represent native ETH in the bridge
const ETH_ADDRESSES = new Set([
  "0x0000000000000000000000000000000000000001",
  "0x0000000000000000000000000000000000000000",
  "0x0000000000000000000000000000000000008001",
]);

type PriceCache = { price: number; fetchedAt: number };
const priceCache = new Map<string, PriceCache>();

function findMainnetAddress(l1Address: string, l1ChainId?: number): string | undefined {
  if (!l1ChainId) return undefined;
  const tokens = wellKnownTokens[l1ChainId];
  if (!tokens) return undefined;
  const match = tokens.find((t: WellKnownToken) => t.address.toLowerCase() === l1Address.toLowerCase());
  return match?.mainnetAddress;
}

async function fetchTokenPrice(mainnetAddress: string): Promise<number | undefined> {
  const cached = priceCache.get(mainnetAddress.toLowerCase());
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.price;
  }

  try {
    const response = await $fetch<Record<string, { usd?: number }>>(
      `${COINGECKO_TOKEN_API}?contract_addresses=${mainnetAddress}&vs_currencies=usd`
    );
    const price = response[mainnetAddress.toLowerCase()]?.usd;
    if (price !== undefined) {
      priceCache.set(mainnetAddress.toLowerCase(), { price, fetchedAt: Date.now() });
    }
    return price;
  } catch {
    return undefined;
  }
}

async function fetchEthPrice(): Promise<number | undefined> {
  const cacheKey = "ethereum";
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.price;
  }

  try {
    const response = await $fetch<Record<string, { usd?: number }>>(
      `${COINGECKO_PRICE_API}?ids=ethereum&vs_currencies=usd`
    );
    const price = response.ethereum?.usd;
    if (price !== undefined) {
      priceCache.set(cacheKey, { price, fetchedAt: Date.now() });
    }
    return price;
  } catch {
    return undefined;
  }
}

export function useCoinGeckoPrice() {
  const providerStore = useBattleChainProviderStore();
  const { bcNetwork } = storeToRefs(providerStore);

  const getTokenPrice = async (l1Address: string): Promise<number | undefined> => {
    if (ETH_ADDRESSES.has(l1Address.toLowerCase())) {
      return await fetchEthPrice();
    }
    const l1ChainId = bcNetwork.value.l1Network?.id;
    const mainnetAddress = findMainnetAddress(l1Address, l1ChainId);
    if (!mainnetAddress) return undefined;
    return await fetchTokenPrice(mainnetAddress);
  };

  return { getTokenPrice };
}

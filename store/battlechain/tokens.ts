import { utils } from "zksync-ethers";

import { customBridgeTokens } from "@/data/customBridgeTokens";
import { wellKnownTokens } from "@/data/wellKnownTokens";

import type { Token } from "@/types";

export const useBattleChainTokensStore = defineStore("battleChainTokens", () => {
  const providerStore = useBattleChainProviderStore();
  const walletStore = useBattleChainWalletStore();

  const { bcNetwork } = storeToRefs(providerStore);

  const {
    result: tokensRaw,
    inProgress: tokensRequestInProgress,
    error: tokensRequestError,
    execute: requestTokens,
    reset: resetTokens,
  } = usePromise<Token[]>(async () => {
    const provider = await providerStore.requestProvider();
    const ethL2TokenAddress = await provider.l2TokenAddress(utils.ETH_ADDRESS);

    // Resolve base token (ETH or custom base token)
    let baseTokenAddress: string | undefined;
    try {
      const l1VoidSigner = await walletStore.getL1VoidSigner(true);
      baseTokenAddress = await l1VoidSigner.getBaseToken();
    } catch {
      // L1 signer unavailable — fall back to ETH as base token
    }
    const baseToken: Token =
      !baseTokenAddress || baseTokenAddress === L2_BASE_TOKEN_ADDRESS
        ? {
            address: L2_BASE_TOKEN_ADDRESS,
            l1Address: utils.ETH_ADDRESS,
            symbol: "ETH",
            name: "Ether",
            decimals: 18,
            iconUrl: "/img/eth.svg",
            isETH: true,
          }
        : {
            address: L2_BASE_TOKEN_ADDRESS,
            l1Address: baseTokenAddress,
            symbol: "BASETOKEN",
            name: "Base Token",
            decimals: 18,
            iconUrl: "/img/base.svg",
            isETH: false,
          };

    let ethToken: Token | undefined;
    if (!baseToken.isETH) {
      ethToken = {
        address: ethL2TokenAddress,
        l1Address: utils.ETH_ADDRESS,
        symbol: "ETH",
        name: "Ether",
        decimals: 18,
        iconUrl: "/img/eth.svg",
      };
    }

    // Use well-known tokens list for the current L1 network
    const l1ChainId = bcNetwork.value.l1Network?.id;
    const knownTokens: Token[] =
      (l1ChainId ? wellKnownTokens[l1ChainId] : [])?.map((t) => ({
        ...t,
        l1Address: t.address,
        address: t.address,
      })) ?? [];

    const finalTokensList = [baseToken, ethToken, ...knownTokens].filter(Boolean) as Token[];
    return finalTokensList;
  });

  const tokens = computed<{ [tokenAddress: string]: Token } | undefined>(() => {
    if (!tokensRaw.value) return undefined;
    const list = Object.fromEntries(tokensRaw.value.map((token) => [token.address, token]));
    return list;
  });
  const l1Tokens = computed<{ [tokenAddress: string]: Token } | undefined>(() => {
    if (!tokensRaw.value) return undefined;
    const list = Object.fromEntries(
      tokensRaw.value
        .filter((e) => e.l1Address)
        .map((token) => {
          const customBridgeToken = customBridgeTokens.find(
            (e) => bcNetwork.value.l1Network?.id === e.chainId && token.l1Address === e.l1Address
          );
          const name = customBridgeToken?.name || token.name;
          const symbol = customBridgeToken?.symbol || token.symbol;
          return [token.l1Address!, { ...token, name, symbol, l1Address: undefined, address: token.l1Address! }];
        })
    );
    return list;
  });
  const baseToken = computed<Token | undefined>(() => {
    if (!tokensRaw.value) return undefined;
    return tokensRaw.value.find((token) => token.address.toUpperCase() === L2_BASE_TOKEN_ADDRESS.toUpperCase());
  });
  const ethToken = computed<Token | undefined>(() => {
    if (!tokensRaw.value) return undefined;
    return tokensRaw.value.find((token) => token.isETH);
  });

  return {
    l1Tokens,
    tokens,
    baseToken,
    ethToken,
    tokensRequestInProgress: computed(() => tokensRequestInProgress.value),
    tokensRequestError: computed(() => tokensRequestError.value),
    requestTokens,
    resetTokens,
  };
});

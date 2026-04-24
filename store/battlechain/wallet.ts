import { $fetch } from "ofetch";
import { L1Signer, L1VoidSigner, BrowserProvider, Signer } from "zksync-ethers";

import { customBridgeTokens } from "@/data/customBridgeTokens";
import { wellKnownTokens } from "@/data/wellKnownTokens";
import { getBalancesWithCustomBridgeTokens, AddressChainType } from "@/utils/helpers";

import type { Api, TokenAmount } from "@/types";
import type { BigNumberish } from "ethers";

export const useBattleChainWalletStore = defineStore("battleChainWallet", () => {
  const onboardStore = useOnboardStore();
  const providerStore = useBattleChainProviderStore();
  const tokensStore = useBattleChainTokensStore();
  const { bcNetwork } = storeToRefs(providerStore);
  const { account } = storeToRefs(onboardStore);
  const { validateAddress } = useScreening();

  const getWellKnownIconUrl = (l1Address?: string): string | undefined => {
    if (!l1Address) return undefined;
    const l1ChainId = bcNetwork.value.l1Network?.id;
    if (!l1ChainId) return undefined;
    const knownToken = wellKnownTokens[l1ChainId]?.find((t) => t.address.toLowerCase() === l1Address.toLowerCase());
    return knownToken?.iconUrl;
  };

  const { execute: getSigner, reset: resetSigner } = usePromise(async () => {
    const walletNetworkId = account.value.chain?.id;
    if (walletNetworkId !== bcNetwork.value.id) {
      throw new Error(
        `Incorrect wallet network selected: #${walletNetworkId} (expected: ${bcNetwork.value.name} #${bcNetwork.value.id})`
      );
    }

    const web3Provider = new BrowserProvider((await onboardStore.getWallet(bcNetwork.value.id)) as any, "any");
    const rawEthersSigner = await web3Provider.getSigner();
    const bcL2Signer = Signer.from(rawEthersSigner, await providerStore.requestProvider());

    return bcL2Signer;
  });
  const { execute: getL1Signer, reset: resetL1Signer } = usePromise(async () => {
    if (!bcNetwork.value.l1Network) throw new Error(`L1 network is not available on ${bcNetwork.value.name}`);

    const walletNetworkId = account.value.chain?.id;
    if (walletNetworkId !== bcNetwork.value.l1Network.id) {
      throw new Error(
        `Incorrect wallet network selected: #${walletNetworkId} (expected: ${bcNetwork.value.l1Network.name} #${bcNetwork.value.l1Network.id})`
      );
    }

    const web3Provider = new BrowserProvider((await onboardStore.getWallet()) as any, "any");
    const rawL1Signer = (await web3Provider.getSigner()) as unknown as any;
    const bcL1Signer = L1Signer.from(rawL1Signer, await providerStore.requestProvider());
    return bcL1Signer;
  });
  const getL1VoidSigner = async (anyAddress = false) => {
    if (!account.value.address && !anyAddress) throw new Error("Address is not available");

    const web3Provider = new BrowserProvider(onboardStore.getPublicClient() as any, "any");
    return new L1VoidSigner(
      account.value.address || L2_BASE_TOKEN_ADDRESS,
      web3Provider,
      await providerStore.requestProvider()
    ) as unknown as L1Signer;
  };

  const {
    result: accountState,
    execute: requestAccountState,
    reset: resetAccountState,
  } = usePromise<Api.Response.Account | Api.Response.Contract>(async () => {
    if (!account.value.address) throw new Error("Account is not available");
    if (!bcNetwork.value.blockExplorerApi)
      throw new Error(`Block Explorer API is not available on ${bcNetwork.value.name}`);

    return await $fetch(`${bcNetwork.value.blockExplorerApi}/address/${account.value.address}`);
  });

  const getBalancesFromBlockExplorerApi = async (): Promise<TokenAmount[]> => {
    await Promise.all([requestAccountState({ force: true }), tokensStore.requestTokens()]);
    if (!accountState.value) throw new Error("Account state is not available");
    if (!tokensStore.tokens) throw new Error("Tokens are not available");
    const baseToken = tokensStore.tokens?.[L2_BASE_TOKEN_ADDRESS];
    return Object.entries(accountState.value.balances)
      .filter(([tokenAddress, { token }]) => token || tokensStore.tokens?.[tokenAddress])
      .map(([tokenAddress, { balance, token }]) => {
        const tokenInfo = token ? mapApiToken(token) : tokensStore.tokens?.[tokenAddress];
        return {
          address:
            tokenInfo!.address === "0x000000000000000000000000000000000000800A" &&
            baseToken?.symbol === tokenInfo?.symbol
              ? baseToken?.address
              : tokenInfo!.address,
          l1Address: tokenInfo!.l1Address || undefined,
          name: tokenInfo!.name || undefined,
          symbol: tokenInfo!.symbol!,
          decimals: tokenInfo!.decimals,
          iconUrl: tokenInfo!.iconUrl || getWellKnownIconUrl(tokenInfo!.l1Address) || undefined,
          price: tokenInfo?.price || undefined,
          amount: balance,
          l1BridgeAddress: tokenInfo?.l1BridgeAddress,
          l2BridgeAddress: tokenInfo?.l2BridgeAddress,
        };
      });
  };
  const getBalancesFromRPC = async (): Promise<TokenAmount[]> => {
    await tokensStore.requestTokens();
    if (!tokensStore.tokens) throw new Error("Tokens are not available");
    if (!account.value.address) throw new Error("Account is not available");

    const provider = await providerStore.requestProvider();
    const balances = await Promise.all(
      Object.entries(tokensStore.tokens).map(async ([, token]) => {
        const amount = await provider.getBalance(onboardStore.account.address!, undefined, token.address);
        return {
          ...token,
          amount: amount.toString(),
        };
      })
    );

    return balances.map((balance) => {
      const customToken = customBridgeTokens.find(
        (token) => token.l2Address.toUpperCase() === balance.address.toUpperCase()
      );
      if (customToken) {
        return {
          ...balance,
          ...customToken,
        };
      }
      return balance;
    });
  };
  const {
    result: balancesResult,
    inProgress: balanceInProgress,
    error: balanceError,
    execute: requestBalance,
    reset: resetBalance,
  } = usePromise<TokenAmount[]>(
    async () => {
      if (bcNetwork.value.blockExplorerApi) {
        return await getBalancesFromBlockExplorerApi();
      } else {
        return await getBalancesFromRPC();
      }
    },
    { cache: 30000 }
  );

  const balance = computed<TokenAmount[]>(() => {
    if (!balancesResult.value) return [];

    const knownTokens: TokenAmount[] = Object.entries(tokensStore.tokens ?? {})
      .map(([, token]) => {
        const amount = balancesResult.value!.find((e) => e.address === token.address)?.amount ?? "0";
        return { ...token, amount };
      })
      .sort((a, b) => {
        if (a.address.toUpperCase() === L2_BASE_TOKEN_ADDRESS.toUpperCase()) return -1; // Always bring ETH to the beginning
        if (b.address.toUpperCase() === L2_BASE_TOKEN_ADDRESS.toUpperCase()) return 1; // Keep ETH at the beginning if comparing with any other token
        return 0; // Keep other tokens' order unchanged
      });
    const knownTokenAddresses = new Set(knownTokens.map((token) => token.address));

    // Filter out the tokens in `balancesResult` that are not in `tokens`
    const otherTokens = balancesResult.value
      .filter((token) => !knownTokenAddresses.has(token.address))
      .map((token) => ({
        ...token,
        iconUrl: token.iconUrl || getWellKnownIconUrl(token.l1Address) || undefined,
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    const sortedTokens = [...knownTokens, ...otherTokens].sort((a, b) => {
      if (a.address.toUpperCase() === L2_BASE_TOKEN_ADDRESS.toUpperCase()) return -1; // Always bring ETH to the beginning
      if (b.address.toUpperCase() === L2_BASE_TOKEN_ADDRESS.toUpperCase()) return 1; // Keep ETH at the beginning if comparing with any other token

      const aPrice = a.price ? Number(a.price) : 0;
      const aAmount = a.amount ? Number(a.amount) : 0;
      const bPrice = b.price ? Number(b.price) : 0;
      const bAmount = b.amount ? Number(b.amount) : 0;
      const aValue = aPrice * aAmount;
      const bValue = bPrice * bAmount;

      return bValue - aValue;
    });

    return getBalancesWithCustomBridgeTokens(sortedTokens, AddressChainType.L2, bcNetwork.value.l1Network?.id);
  });

  const deductBalance = (tokenAddress: string, amount: BigNumberish) => {
    if (!balance.value) return;
    const tokenBalance = balance.value.find((balance) => balance.address === tokenAddress);
    if (!tokenBalance) return;
    const newBalance = BigInt(tokenBalance.amount) - BigInt(amount);
    tokenBalance.amount = newBalance < 0n ? "0" : newBalance.toString();
  };

  const isCorrectNetworkSet = computed(() => {
    const walletNetworkId = account.value.chain?.id;
    return walletNetworkId === bcNetwork.value.id;
  });
  const {
    inProgress: switchingNetworkInProgress,
    error: switchingNetworkError,
    execute: switchNetwork,
  } = usePromise(
    async () => {
      return await onboardStore.switchNetworkById(bcNetwork.value.id, bcNetwork.value.name);
    },
    { cache: false }
  );
  const setCorrectNetwork = async () => {
    return await switchNetwork().catch(() => undefined);
  };

  const { execute: walletAddressValidate, reload: reloadWalletAddressValidation } = usePromise(async () => {
    if (!account.value.address) throw new Error("Account is not available");
    await validateAddress(account.value.address); // Throws an error if the address is not valid
  });
  walletAddressValidate().catch(() => undefined);

  onboardStore.subscribeOnAccountChange(() => {
    resetSigner();
    resetL1Signer();
    resetAccountState();
    resetBalance();
    reloadWalletAddressValidation().catch(() => undefined);
  });

  return {
    getSigner,
    getL1Signer,
    getL1VoidSigner,

    balance,
    balanceInProgress: computed(() => balanceInProgress.value),
    balanceError: computed(() => balanceError.value),
    requestBalance,
    deductBalance,

    isCorrectNetworkSet,
    switchingNetworkInProgress,
    switchingNetworkError,
    setCorrectNetwork,

    walletAddressValidate,
  };
});

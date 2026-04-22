<template>
  <CommonModal v-model:opened="isModalOpened" class="token-select-modal" :title="title" @after-leave="search = ''">
    <Combobox v-model="selectedToken">
      <!-- TODO: Refactor this to use ComboboxInput as main component but look like CommonInputSearch -->
      <CommonInputSearch
        v-model.trim="search"
        class="mb-block-padding-1/4"
        placeholder="Symbol or address"
        autofocus="desktop"
      >
        <template #icon>
          <MagnifyingGlassIcon aria-hidden="true" />
        </template>
      </CommonInputSearch>
      <div class="-mx-block-padding-1/2 h-full overflow-auto px-block-padding-1/2">
        <template v-if="loading">
          <div class="-mx-block-padding-1/2">
            <TokenBalanceLoader v-for="index in 2" :key="index" variant="light" />
          </div>
        </template>
        <template v-else-if="error">
          <CommonErrorBlock class="m-2" @try-again="emit('try-again')">
            {{ error.message }}
          </CommonErrorBlock>
        </template>
        <template v-else-if="!hasBalances && (!search || displayedTokens.length)">
          <CommonLineButtonsGroup class="category" :gap="false" :margin-y="false">
            <TokenLine
              v-for="item in displayedTokens"
              :key="item.l2Address ? `${item.address}-${item.l2Address}` : item.address"
              class="token-line"
              v-bind="item"
              @click="selectedToken = item"
            />
          </CommonLineButtonsGroup>
        </template>
        <template v-else-if="balanceGroups.length || !search">
          <div v-for="(group, index) in balanceGroups" :key="index" class="category">
            <TypographyCategoryLabel size="sm" variant="darker" class="group-category-label">
              {{ group.title || "Your assets" }}
            </TypographyCategoryLabel>
            <CommonLineButtonsGroup :gap="false">
              <TokenBalance
                v-for="item in group.balances"
                v-bind="item"
                :key="item.l2Address ? `${item.address}-${item.l2Address}` : item.address"
                variant="light"
                @click="selectedToken = item"
              />
            </CommonLineButtonsGroup>
          </div>
        </template>
        <template v-else-if="displayedTokens.length">
          <CommonLineButtonsGroup class="category" :gap="false" :margin-y="false">
            <TokenLine
              v-for="item in displayedTokens"
              :key="item.l2Address ? `${item.address}-${item.l2Address}` : item.address"
              class="token-line"
              v-bind="item"
              @click="selectedToken = item"
            />
          </CommonLineButtonsGroup>
        </template>
        <template v-else-if="shouldLookupCustomToken">
          <div v-if="!customToken" class="mt-block-padding-1/2 text-center">
            <CommonContentLoader :length="20" />
            <p class="mt-2 text-sm text-gray-400">Looking up token...</p>
          </div>
          <div v-else class="mt-block-padding-1/2">
            <TypographyCategoryLabel size="sm" variant="darker" class="mb-2"> Import token </TypographyCategoryLabel>
            <CommonLineButtonsGroup :gap="false">
              <TokenLine v-bind="customToken" class="token-line" @click="selectCustomToken(customToken)" />
            </CommonLineButtonsGroup>
          </div>
        </template>
        <p v-else class="mt-block-padding-1/2 text-center">
          No results for "{{ search }}"
          <br />
          <span class="mt-1.5 inline-block text-sm text-neutral-500">
            To bridge an unlisted token, paste its L1 contract address above
          </span>
        </p>
        <slot name="body-bottom" />
      </div>
    </Combobox>
  </CommonModal>
</template>

<script lang="ts" setup>
import { Combobox } from "@headlessui/vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import { isAddress } from "ethers";

import { IERC20_ABI } from "@/data/abis/ierc20Abi";

import type { Token, TokenAmount } from "@/types";

const ERC20_METADATA_ABI = [
  ...IERC20_ABI,
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
] as const;

const ERC165_ABI = [
  {
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
// ERC721 interface ID
const ERC721_INTERFACE_ID = "0x80ac58cd" as const;

const props = defineProps({
  title: {
    type: String,
    default: "Choose token",
  },
  opened: {
    type: Boolean,
    default: false,
  },
  tokenAddress: {
    type: String,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Error,
  },
  tokens: {
    type: Array as PropType<Token[]>,
    default: () => [],
  },
  balances: {
    type: Array as PropType<TokenAmount[]>,
    default: () => [],
  },
});

const emit = defineEmits<{
  (eventName: "update:opened", value: boolean): void;
  (eventName: "update:tokenAddress", tokenAddress?: string): void;
  (eventName: "try-again"): void;
  (eventName: "custom-token", token: Token): void;
}>();

const onboardStore = useOnboardStore();

const search = ref("");
const hasBalances = computed(() => props.balances.length > 0);
const filterTokens = (tokens: Token[]) => {
  const lowercaseSearch = search.value.toLowerCase();
  if (lowercaseSearch === "") {
    return tokens.slice(0, 100);
  }
  return tokens.filter(({ address, name, symbol }) =>
    Object.values({ address, name, symbol })
      .filter((e) => typeof e === "string")
      .some((value) => value!.toLowerCase().includes(lowercaseSearch))
  );
};
const displayedTokens = computed(() => filterTokens(props.tokens));
const displayedBalances = computed(() => filterTokens(props.balances) as TokenAmount[]);
const balanceGroups = groupBalancesByAmount(displayedBalances);

// Custom token lookup when search is an address not in the existing list
const customToken = ref<Token | undefined>();
const customTokenFetching = ref(false);
const customTokenError = ref(false);
const isSearchAnAddress = computed(() => search.value.length === 42 && isAddress(search.value));
const isSearchAddressKnown = computed(() => {
  if (!isSearchAnAddress.value) return false;
  const addr = search.value.toLowerCase();
  return (
    props.tokens.some((t) => t.address.toLowerCase() === addr) ||
    props.balances.some((t) => t.address.toLowerCase() === addr)
  );
});
const shouldLookupCustomToken = computed(
  () => isSearchAnAddress.value && !isSearchAddressKnown.value && !customTokenError.value
);

watch(search, async (value) => {
  customToken.value = undefined;
  customTokenFetching.value = false;
  customTokenError.value = false;
  if (!isSearchAnAddress.value || isSearchAddressKnown.value) return;

  customTokenFetching.value = true;
  try {
    const publicClient = onboardStore.getPublicClient();
    const address = value as `0x${string}`;
    const [name, symbol, decimals] = await Promise.all([
      publicClient.readContract({ address, abi: ERC20_METADATA_ABI, functionName: "name" }),
      publicClient.readContract({ address, abi: ERC20_METADATA_ABI, functionName: "symbol" }),
      publicClient.readContract({ address, abi: ERC20_METADATA_ABI, functionName: "decimals" }),
    ]);

    // Reject ERC721/ERC1155 tokens that also expose name/symbol/decimals
    try {
      const isERC721 = await publicClient.readContract({
        address,
        abi: ERC165_ABI,
        functionName: "supportsInterface",
        args: [ERC721_INTERFACE_ID],
      });
      if (isERC721) {
        customTokenError.value = true;
        return;
      }
    } catch {
      // No ERC165 support — expected for most ERC20s, safe to continue
    }

    if (search.value === value) {
      customToken.value = {
        address,
        l1Address: address,
        name: name as string,
        symbol: symbol as string,
        decimals: Number(decimals),
      };
    }
  } catch {
    customToken.value = undefined;
    customTokenError.value = true;
  } finally {
    customTokenFetching.value = false;
  }
});

const selectCustomToken = (token: Token) => {
  emit("custom-token", token);
  selectedTokenAddress.value = token.address;
  closeModal();
};

const selectedTokenAddress = computed({
  get: () => props.tokenAddress,
  set: (value) => emit("update:tokenAddress", value),
});
const selectedToken = computed({
  get: () => {
    if (!props.tokens) {
      return undefined;
    }
    return props.tokens.find((e) => e.address === selectedTokenAddress.value);
  },
  set: (value) => {
    if (value) {
      // Handle special case for L1 tokens with multiple L2 counterparts (native and bridged) - create unique identifier
      const hasMultipleTokens =
        props.tokens.filter((e) => e.address === value.address).length > 1 ||
        props.balances.filter((e) => e.address === value.address).length > 1;
      selectedTokenAddress.value = hasMultipleTokens ? `${value.address}-${value.l2Address}` : value.address;
    } else {
      selectedTokenAddress.value = undefined;
    }
    closeModal();
  },
});

const isModalOpened = computed({
  get: () => props.opened,
  set: (value) => emit("update:opened", value),
});
const closeModal = () => {
  isModalOpened.value = false;
};
</script>

<style lang="scss">
.token-select-modal {
  .modal-card {
    @apply grid h-full grid-rows-[max-content_max-content_1fr];
  }
  .category:first-child .group-category-label {
    @apply mt-block-padding-1/2;
  }
}
</style>

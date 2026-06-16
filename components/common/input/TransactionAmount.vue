<template>
  <div>
    <TokenSelectModal
      v-model:opened="selectTokenModalOpened"
      v-model:token-address="selectedTokenAddress"
      :loading="loading"
      :tokens="tokens"
      :balances="balances"
      @custom-token="(token: Token) => emit('custom-token', token)"
    >
      <template v-if="$slots['token-dropdown-bottom']" #body-bottom>
        <slot name="token-dropdown-bottom" />
      </template>
    </TokenSelectModal>
    <CommonContentBlock for="transaction-amount-input" as="label">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2 overflow-hidden">
          <div class="font-bold">{{ label }}</div>
          <slot name="dropdown" />
        </div>
        <transition v-bind="TransitionOpacity()">
          <template v-if="displayedMaxAmount && displayedMaxAmount !== '0'">
            <span>
              <CommonButtonLabel variant="light" as="span">Max:&nbsp;</CommonButtonLabel>
              <CommonButtonLabel
                variant="light"
                :class="{ 'is-max': isMaxAmountSet }"
                :title="isMaxAmountSet ? 'Max amount is set' : `Your max amount is ${maxDecimalAmount}`"
                @click.prevent="setMaxAmount()"
              >
                {{ displayedMaxAmount }}
              </CommonButtonLabel>
            </span>
          </template>
        </transition>
      </div>
      <div class="mt-4 flex gap-2">
        <div class="w-full">
          <div class="flex items-center">
            <span v-if="displayMode === 'usd'" class="text-[40px] leading-none text-gray-300 dark:text-neutral-400"
              >$</span
            >
            <CommonInputLine
              id="transaction-amount-input"
              v-model.trim="inputDisplay"
              :has-error="!!amountError"
              class="text-[40px]"
              placeholder="0"
              type="text"
              maxlength="25"
              spellcheck="false"
              autocomplete="off"
              autofocus
            />
          </div>
          <transition v-bind="TransitionOpacity()" mode="default">
            <CommonInputErrorMessage v-if="amountError">
              <template v-if="amountError === 'insufficient_balance' || maxDecimalAmount === '0'">
                Insufficient balance
              </template>
              <template v-else-if="amountError === 'exceeds_balance' && !maxAmount">Amount exceeds balance</template>
              <template v-else-if="amountError === 'exceeds_max_amount' || amountError === 'exceeds_balance'">
                Max amount is
                <button
                  type="button"
                  class="cursor-pointer font-medium underline underline-offset-2"
                  @click.prevent="setMaxAmount()"
                >
                  {{ maxDecimalAmount }}
                </button>
              </template>
              <template v-else-if="amountError === 'exceeds_decimals'">
                Max decimal length for {{ selectedToken?.symbol }} is {{ selectedToken?.decimals }}
              </template>
            </CommonInputErrorMessage>
            <CommonButtonLabel
              v-else-if="convertedDisplay"
              as="div"
              variant="light"
              class="-mb-6 mt-1 text-right text-sm"
            >
              {{ convertedDisplay }}
            </CommonButtonLabel>
          </transition>
        </div>

        <div class="flex h-max flex-col items-end gap-2">
          <div class="flex gap-2">
            <transition v-bind="TransitionOpacity(300)">
              <div v-if="approveRequired" v-tooltip="'Allowance approval required'">
                <LockClosedIcon class="mt-4 h-6 w-6 text-warning-400" aria-hidden="true" />
              </div>
            </transition>
            <CommonButtonDropdown
              class="h-max"
              :toggled="selectTokenModalOpened"
              variant="light"
              :disabled="loading"
              @click="selectTokenModalOpened = true"
            >
              <template #left-icon>
                <CommonContentLoader v-if="loading" class="block h-full w-full rounded-full" />
                <TokenImage v-else-if="selectedToken" v-bind="selectedToken" />
              </template>
              <CommonContentLoader v-if="loading" :length="7" />
              <span v-else-if="selectedToken">{{ selectedToken.symbol }}</span>
            </CommonButtonDropdown>
          </div>
          <div
            v-if="canUseUsd"
            class="flex items-center rounded-full bg-gray-200 p-0.5 text-xs font-medium dark:bg-neutral-900"
          >
            <button
              type="button"
              class="rounded-full px-2.5 py-1 transition-colors"
              :class="
                displayMode === 'token'
                  ? 'bg-white text-neutral-950 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              "
              @click.prevent="setDisplayMode('token')"
            >
              {{ selectedToken?.symbol }}
            </button>
            <button
              type="button"
              class="rounded-full px-2.5 py-1 transition-colors"
              :class="
                displayMode === 'usd'
                  ? 'bg-white text-neutral-950 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              "
              @click.prevent="setDisplayMode('usd')"
            >
              USD
            </button>
          </div>
        </div>
      </div>
    </CommonContentBlock>
  </div>
</template>

<script lang="ts" setup>
import { LockClosedIcon } from "@heroicons/vue/24/outline";

import { useSentryLogger } from "@/composables/useSentryLogger";

import type { Token, TokenAmount } from "@/types";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "Amount",
  },
  tokens: {
    type: Array as PropType<Token[]>,
    default: () => [],
  },
  balances: {
    type: Array as PropType<TokenAmount[]>,
    default: () => [],
    required: true,
  },
  approveRequired: {
    type: Boolean,
    default: false,
  },
  tokenAddress: {
    type: String,
  },
  maxAmount: {
    type: String,
  },
  error: {
    type: String,
  },
  usdPrice: {
    // Reliable USD price for the selected token (e.g. from an oracle / CoinGecko).
    // Falls back to the token's own `price` field when not provided.
    type: Number,
    default: undefined,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (eventName: "update:error", error?: string): void;
  (eventName: "update:modelValue", amount: string): void;
  (eventName: "update:tokenAddress", tokenAddress?: string): void;
  (eventName: "custom-token", token: Token): void;
}>();

const { captureException } = useSentryLogger();

const selectedTokenAddress = computed({
  get: () => props.tokenAddress,
  set: (value?: string) => emit("update:tokenAddress", value),
});
const selectedToken = computed(() => {
  if (props.balances.length) {
    const fromBalances = props.balances.find((e) => e.address === props.tokenAddress);
    if (fromBalances) return fromBalances;
  }
  return props.tokens.find((e) => e.address === props.tokenAddress);
});
const tokenBalance = computed(() => {
  if (!props.balances.length || !selectedToken.value) {
    return undefined;
  }
  return props.balances.find((e) => e.address === selectedToken.value?.address);
});
const selectTokenModalOpened = ref(false);

// Effective USD price: prefer the explicitly provided oracle price, fall back to the token's own price.
const effectivePrice = computed(() => props.usdPrice ?? selectedToken.value?.price);
const canUseUsd = computed(() => !!effectivePrice.value && effectivePrice.value > 0);

// "token" => user types the token amount, "usd" => user types a USD amount.
const displayMode = ref<"token" | "usd">("token");
// What the user literally typed while in USD mode (kept separate so converting back and forth doesn't jitter).
const usdBuffer = ref("");

const sanitizeNumeric = (value: string) => value.replace(/[^0-9.,]/g, "").replace(",", ".");

// Convert a USD string to the equivalent token amount string (matched to the token's decimals).
const usdToToken = (usdStr: string): string => {
  if (!usdStr || !effectivePrice.value || !selectedToken.value) return "";
  const usd = parseFloat(usdStr);
  if (!isFinite(usd)) return "";
  if (usd === 0) return "0";
  const decimals = Math.min(selectedToken.value.decimals, 18);
  let result = (usd / effectivePrice.value).toFixed(decimals);
  if (result.includes(".")) {
    result = result.replace(/0+$/, "").replace(/\.$/, "");
  }
  return result;
};

// Convert a token amount string to a USD string (2 decimals) for pre-filling the USD input.
const tokenToUsdInput = (tokenStr: string): string => {
  if (!tokenStr || !effectivePrice.value) return "";
  const value = parseFloat(tokenStr) * effectivePrice.value;
  if (!isFinite(value) || value === 0) return "";
  return value.toFixed(2);
};

// The value bound to the visible input. In USD mode it shows the USD buffer while still
// emitting the underlying token amount, so all downstream logic keeps working in token units.
const inputDisplay = computed({
  get: () => (displayMode.value === "usd" ? usdBuffer.value : props.modelValue),
  set: (value: string) => {
    const sanitized = sanitizeNumeric(value);
    if (displayMode.value === "usd") {
      usdBuffer.value = sanitized;
      emit("update:modelValue", usdToToken(sanitized));
    } else {
      emit("update:modelValue", sanitized);
    }
  },
});

const totalComputeAmount = computed(() => {
  try {
    if (!props.modelValue || !selectedToken.value) {
      return 0n;
    }
    return decimalToBigNumber(props.modelValue, selectedToken.value.decimals);
  } catch (error) {
    captureException({
      error: error as Error,
      parentFunctionName: "totalComputeAmount",
      parentFunctionParams: [],
      filePath: "components/common/input/TransactionAmount.vue",
    });
    return 0n;
  }
});

// The "other" denomination shown under the input: USD value while typing token, token value while typing USD.
const convertedDisplay = computed(() => {
  if (displayMode.value === "usd") {
    if (!selectedToken.value || !props.modelValue || totalComputeAmount.value === 0n) return "";
    const tokenAmount = removeSmallAmountPretty(
      totalComputeAmount.value,
      selectedToken.value.decimals,
      effectivePrice.value ?? 1
    );
    return `≈ ${tokenAmount} ${selectedToken.value.symbol}`;
  }
  if (!selectedToken.value || !effectivePrice.value || !props.modelValue) {
    return "";
  }
  return formatTokenPrice(totalComputeAmount.value, selectedToken.value.decimals, effectivePrice.value);
});

const setDisplayMode = (mode: "token" | "usd") => {
  if (mode === displayMode.value) return;
  if (mode === "usd") {
    if (!canUseUsd.value) return;
    // Pre-fill the USD field from whatever token amount is currently entered.
    usdBuffer.value = tokenToUsdInput(props.modelValue);
  }
  displayMode.value = mode;
};

// If the active token loses its price (or changes), fall back to token entry to avoid a stale/blank USD mode.
watch(canUseUsd, (usable) => {
  if (!usable && displayMode.value === "usd") {
    displayMode.value = "token";
  }
});

// When the price or token changes while in USD mode, re-derive the token amount from what the user typed.
watch([effectivePrice, () => selectedToken.value?.address], () => {
  if (displayMode.value === "usd" && usdBuffer.value) {
    emit("update:modelValue", usdToToken(usdBuffer.value));
  }
});

// Keep the USD buffer in sync when the amount is cleared/reset externally (e.g. after a successful deposit).
watch(
  () => props.modelValue,
  (value) => {
    if (value === "" && displayMode.value === "usd") {
      usdBuffer.value = "";
    }
  }
);
const maxDecimalAmount = computed(() => {
  // Full decimal amount
  if (!props.maxAmount || !selectedToken.value) {
    return;
  }
  return parseTokenAmount(props.maxAmount, selectedToken.value.decimals);
});
const displayedMaxAmount = computed(() => {
  // Displayed shortened amount
  if (!maxDecimalAmount.value || !effectivePrice.value || !selectedToken.value) {
    return maxDecimalAmount.value;
  }
  return removeSmallAmountPretty(props.maxAmount!, selectedToken.value.decimals, effectivePrice.value);
});
const isMaxAmountSet = computed(() => {
  if (!props.maxAmount) {
    return false;
  }
  return totalComputeAmount.value === BigInt(props.maxAmount);
});
const setMaxAmount = () => {
  if (!maxDecimalAmount.value) return;
  if (displayMode.value === "usd") {
    usdBuffer.value = tokenToUsdInput(maxDecimalAmount.value);
  }
  emit("update:modelValue", maxDecimalAmount.value);
};

const amountError = computed(() => {
  if (!selectedToken.value) return;
  if (tokenBalance.value && totalComputeAmount.value > BigInt(tokenBalance.value.amount)) {
    return "exceeds_balance";
  }
  if (props.maxAmount && totalComputeAmount.value > BigInt(props.maxAmount)) {
    if (BigInt(props.maxAmount) === BigInt(0)) {
      return "insufficient_balance";
    }
    return "exceeds_max_amount";
  }
  if (props.modelValue) {
    const [, decimal] = props.modelValue.split(".");
    if (decimal && decimal.length > selectedToken.value.decimals) {
      return "exceeds_decimals";
    }
  }
  return undefined;
});
watch(
  amountError,
  (value) => {
    emit("update:error", value);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped></style>

<template>
  <CommonModal v-model:opened="modalDisplayed" :initial-focus="checkbox" :closable="false">
    <DialogTitle as="div" class="modal-title">Welcome to BattleChain Bridge</DialogTitle>
    <div class="modal-body">
      <p>BattleChain is a pre-mainnet, post-testnet blockchain for stress-testing smart contracts with real funds.</p>
      <p>
        Protocols deployed here may enter Attack Mode, where whitehats can legally exploit vulnerabilities for bounties.
        Bridge only funds you are comfortable putting at controlled risk.
      </p>
      <p>
        This bridge is in beta and subject to further development and changes. Use of any features available through
        this website is done so entirely at your own risk.
      </p>
    </div>

    <CommonCheckboxWithText ref="checkbox" v-model="warningChecked" class="mt-6 text-sm">
      I understand the risks of BattleChain and agree to the
      <a href="https://battlechain.com/terms" target="_blank" class="checkbox-link">Terms of Service</a> and
      <a href="https://battlechain.com/privacy" target="_blank" class="checkbox-link">Privacy Policy</a>
    </CommonCheckboxWithText>
    <CommonButton class="mt-6 w-full" variant="primary" :disabled="!warningChecked" @click="proceed()">
      I understand, proceed
    </CommonButton>
  </CommonModal>
</template>

<script lang="ts" setup>
import { DialogTitle } from "@headlessui/vue";
import { useStorage } from "@vueuse/core";

import { isCustomNode } from "@/data/networks";

const { selectedNetwork } = storeToRefs(useNetworkStore());

const checkbox = ref<HTMLInputElement | undefined>();
const noticeAccepted = useStorage("battlechain-bridge-notice-accepted", false);
const warningChecked = ref(noticeAccepted.value);
const modalDisplayed = ref(!noticeAccepted.value && !isCustomNode && !selectedNetwork.value.isPrividium);

const proceed = () => {
  noticeAccepted.value = true;
  modalDisplayed.value = false;
};
</script>

<style lang="scss" scoped>
.modal-title {
  @apply mb-6 text-xl font-medium;
}
.modal-body {
  @apply flex flex-col gap-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400;
}
.checkbox-link {
  @apply underline underline-offset-2;
}
</style>

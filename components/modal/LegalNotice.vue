<template>
  <CommonModal v-model:opened="modalDisplayed" :initial-focus="checkbox" :closable="false">
    <DialogTitle as="div" class="modal-title">Welcome to BattleChain Bridge</DialogTitle>
    <div class="modal-body">
      <p>
        BattleChain is an <strong>adversarial</strong>, pre-mainnet blockchain for stress-testing smart contracts with
        real funds. Protocols deployed here may enter Attack Mode, where whitehats can legally exploit vulnerabilities
        for bounties.
      </p>
      <p>
        Treat anything you bridge as funds you may lose in full: you can <strong>lose 100%</strong> of bridged funds,
        with no recovery, refunds, or insurance. This bridge is in beta and used entirely at your own risk.
      </p>
    </div>

    <CommonCheckboxWithText ref="checkbox" v-model="warningChecked" class="mt-6 text-sm">
      I understand the risks of BattleChain and agree to the
      <a :href="termsUrl" target="_blank" rel="noopener" class="checkbox-link">Terms of Service</a> and
      <a :href="privacyUrl" target="_blank" rel="noopener" class="checkbox-link">Privacy Policy</a>
    </CommonCheckboxWithText>
    <CommonButton class="mt-6 w-full" variant="primary" :disabled="!warningChecked" @click="proceed()">
      I understand, proceed
    </CommonButton>
  </CommonModal>
</template>

<script lang="ts" setup>
import { DialogTitle } from "@headlessui/vue";

import { isCustomNode } from "@/data/networks";

const { selectedNetwork } = storeToRefs(useNetworkStore());
const { noticeAccepted, acceptNotice, termsUrl, privacyUrl } = useTermsAcceptance();

const checkbox = ref<HTMLInputElement | undefined>();
const warningChecked = ref(false);
const modalDisplayed = ref(!noticeAccepted.value && !isCustomNode && !selectedNetwork.value.isPrividium);

const proceed = () => {
  acceptNotice();
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

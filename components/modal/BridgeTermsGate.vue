<template>
  <CommonModal
    v-model:opened="isOpened"
    :initial-focus="firstCheckbox"
    :closable="true"
    :close-on-background-click="false"
  >
    <DialogTitle as="div" class="modal-title">⚔️ Before you bridge: agree to the rules</DialogTitle>
    <div class="modal-body">
      <p>
        BattleChain is an <strong>adversarial</strong> network — a live security-testing arena. Funds and contracts
        placed in scope are actively attacked by other players.
      </p>
      <ul class="risk-list">
        <li><strong>Adversarial by design</strong> — contracts in Attack Mode are fair game.</li>
        <li><strong>You can lose 100%</strong> of what you bridge. No recovery, refunds, or insurance.</li>
        <li><strong>You're responsible</strong> for checking a contract's on-chain status before you act.</li>
        <li><strong>You keep your keys.</strong> We don't control the chain or other players.</li>
      </ul>
    </div>

    <CommonCheckboxWithText ref="firstCheckbox" v-model="agreedToTerms" class="mt-6 !justify-start text-sm">
      I have read and agree to the BattleChain
      <a :href="termsUrl" target="_blank" rel="noopener" class="checkbox-link">Terms of Service</a> and
      <a :href="privacyUrl" target="_blank" rel="noopener" class="checkbox-link">Privacy Policy</a>
    </CommonCheckboxWithText>
    <CommonCheckboxWithText v-model="acknowledgedRisk" class="mt-4 !justify-start text-sm">
      I understand BattleChain is adversarial and I may lose 100% of the funds I bridge, with no recovery
    </CommonCheckboxWithText>

    <CommonButton class="mt-6 w-full" variant="primary" :disabled="!canProceed" @click="accept()">
      Agree &amp; bridge now
    </CommonButton>
    <CommonButton class="mt-3 w-full" variant="cancel" @click="cancel()">Cancel</CommonButton>
  </CommonModal>
</template>

<script lang="ts" setup>
import { DialogTitle } from "@headlessui/vue";

const props = defineProps<{ opened: boolean }>();
const emit = defineEmits<{
  (eventName: "update:opened", value: boolean): void;
  (eventName: "accept"): void;
}>();

const { termsUrl, privacyUrl } = useTermsAcceptance();

const firstCheckbox = ref<HTMLInputElement | undefined>();
const agreedToTerms = ref(false);
const acknowledgedRisk = ref(false);
const canProceed = computed(() => agreedToTerms.value && acknowledgedRisk.value);

const isOpened = computed({
  get: () => props.opened,
  set: (value) => emit("update:opened", value),
});

watch(
  () => props.opened,
  (opened) => {
    if (!opened) {
      agreedToTerms.value = false;
      acknowledgedRisk.value = false;
    }
  }
);

const accept = () => {
  if (!canProceed.value) {
    return;
  }
  emit("accept");
};
const cancel = () => {
  isOpened.value = false;
};
</script>

<style lang="scss" scoped>
.modal-title {
  @apply mb-6 text-xl font-medium;
}
.modal-body {
  @apply flex flex-col gap-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400;

  .risk-list {
    @apply flex list-disc flex-col gap-2 pl-5;
  }
}
.checkbox-link {
  @apply underline underline-offset-2;
}
</style>

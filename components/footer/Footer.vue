<template>
  <footer class="footer">
    <div>
      <CommonButtonLabel v-if="showAddNetworkButton" @click="addNetworkToWallet()">
        Add {{ bcNetwork.name }} to your wallet
      </CommonButtonLabel>
    </div>
    <div class="links-container">
      <CommonButtonLabel v-if="!!gitCommitUrl" as="a" :href="gitCommitUrl" target="_blank" class="footer-link">
        <span class="github-link-content">
          <IconsGitHub class="h-6 w-6" />
          {{ portalRuntimeConfig.gitCommitHash }}
        </span>
      </CommonButtonLabel>
      <CommonButtonLabel as="a" href="https://battlechain.com/terms" target="_blank" class="footer-link">
        Terms of Service
      </CommonButtonLabel>
      <CommonButtonLabel as="a" href="https://battlechain.com/privacy" target="_blank" class="footer-link">
        Privacy Policy
      </CommonButtonLabel>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const portalRuntimeConfig = usePortalRuntimeConfig();
const bcWalletStore = useBattleChainWalletStore();
const { isCorrectNetworkSet } = storeToRefs(bcWalletStore);
const { isConnected, connectorName } = storeToRefs(useOnboardStore());
const { bcNetwork } = storeToRefs(useBattleChainProviderStore());
const addNetworkToWallet = async () => {
  await bcWalletStore.setCorrectNetwork();
};

const showAddNetworkButton = computed(() => {
  return isConnected.value && !isCorrectNetworkSet.value && connectorName.value !== "WalletConnect";
});

const gitCommitUrl = computed(() =>
  portalRuntimeConfig.gitRepoUrl && portalRuntimeConfig.gitCommitHash
    ? `${portalRuntimeConfig.gitRepoUrl}/commit/${portalRuntimeConfig.gitCommitHash}`
    : ""
);
</script>

<style lang="scss" scoped>
.footer {
  @apply flex flex-col items-center justify-between gap-x-8 gap-y-4 px-4 py-8 sm:flex-row;

  .links-container {
    @apply flex w-max flex-wrap items-center justify-center gap-x-8 gap-y-4 whitespace-nowrap;
  }

  .github-link-content {
    @apply flex items-center gap-1;
  }
}
</style>

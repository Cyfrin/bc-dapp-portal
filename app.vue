<template>
  <NuxtLayout>
    <slot />
  </NuxtLayout>
</template>

<script lang="ts" setup>
useBattleChainWithdrawalsStore().updateWithdrawalsIfPossible(); // init store to update withdrawals

const route = useRoute();
watch(
  () => route.path,
  () => {
    trackPage();
  },
  { immediate: true }
);

const portalRuntimeConfig = usePortalRuntimeConfig();
if (portalRuntimeConfig.gitRepoUrl && portalRuntimeConfig.gitCommitHash) {
  logger.log(`=== App source: ${portalRuntimeConfig.gitRepoUrl}/commit/${portalRuntimeConfig.gitCommitHash} ===`);
}
</script>

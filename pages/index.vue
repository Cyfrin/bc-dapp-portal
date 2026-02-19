<template>
  <div></div>
</template>

<script lang="ts" setup>
const router = useRouter();
const { bcNetwork } = storeToRefs(useBattleChainProviderStore());

const newUrl = new URL(window.location.href);
newUrl.pathname = bcNetwork.value.l1Network ? "/bridge" : "/assets";
await router.replace(newUrl.href.slice(newUrl.origin.length));
</script>

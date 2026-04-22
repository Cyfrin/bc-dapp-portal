<template>
  <img :src="iconUrl" alt="BattleChain" />
</template>

<script lang="ts" setup>
const { selectedColorMode } = useColorMode();
const iconUrl = computed(() => (selectedColorMode.value === "dark" ? "/img/Logo-light.svg" : "/img/Logo-dark.svg"));
</script>

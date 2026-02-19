<template>
  <div>
    <CommonAlert variant="warning" size="sm" :icon="ExclamationTriangleIcon" class="mb-block-gap">
      <p>
        Only {{ bcNetwork.nativeCurrency!.symbol }} is allowed for bridging {{ type === "withdraw" ? "from" : "to" }}
        {{ bcNetwork.name }}.
      </p>
    </CommonAlert>
  </div>
</template>

<script lang="ts" setup>
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

import type { BattleChainNetwork } from "@/data/networks"; // Adjust the import path as needed

defineProps<{
  bcNetwork: BattleChainNetwork;
  type: "withdraw" | "deposit";
}>();
</script>

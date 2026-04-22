<template>
  <div>
    <PageTitle :fallback-route="{ name: 'assets' }">Receive</PageTitle>

    <div class="space-y-4">
      <CommonCardWithLineButtons>
        <DestinationItem
          label="View address"
          :description="`Receive from another ${destinations.era.label} account`"
          as="RouterLink"
          :to="{ name: 'receive' }"
        >
          <template #image>
            <QrCodeIcon class="p-0.5" />
          </template>
        </DestinationItem>
      </CommonCardWithLineButtons>
      <CommonCardWithLineButtons>
        <DestinationItem
          v-if="bcNetwork.l1Network"
          label="Official bridge"
          :description="`Receive from your ${destinations.ethereum.label} account`"
          :icon-url="destinations.ethereum.iconUrl"
          as="RouterLink"
          :to="{ name: 'bridge', query: $route.query }"
        />
      </CommonCardWithLineButtons>
      <!--CommonCardWithLineButtons v-if="isMainnet && bcNetwork.displaySettings?.showPartnerLinks">
        <DestinationItem
          label="Top-up with cash"
          description="Buy tokens using a card or another method for fiat"
          as="a"
          href="https://battlechain.dappradar.com/ecosystem?category=non_dapps_on_off_ramps"
          target="_blank"
          :icon="ArrowTopRightOnSquareIcon"
        >
          <template #image>
            <DestinationIconContainer>
              <BanknotesIcon aria-hidden="true" />
            </DestinationIconContainer>
          </template>
        </DestinationItem>
      </CommonCardWithLineButtons>
      <CommonCardWithLineButtons v-if="isMainnet && bcNetwork.displaySettings?.showPartnerLinks">
        <DestinationItem
          label="Bridge from other networks"
          description="Explore ecosystem of third party bridges"
          as="a"
          href="https://battlechain.dappradar.com/ecosystem?category=defi_bridge"
          target="_blank"
          :icon="ArrowTopRightOnSquareIcon"
        >
          <template #image>
            <DestinationIconContainer>
              <ArrowsUpDownIcon aria-hidden="true" />
            </DestinationIconContainer>
          </template>
        </DestinationItem>
      </CommonCardWithLineButtons-->
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  // ArrowsUpDownIcon,
  // BanknotesIcon,
  QrCodeIcon,
} from "@heroicons/vue/24/outline";

const { destinations } = storeToRefs(useDestinationsStore());
const { bcNetwork } = storeToRefs(useBattleChainProviderStore());
</script>

<style lang="scss" scoped></style>

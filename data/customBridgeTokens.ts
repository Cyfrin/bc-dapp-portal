export type CustomBridgeToken = {
  chainId: number;
  l1Address: string;
  l2Address: string;
  symbol: string;
  bridgedSymbol: string;
  decimals: number;
  name?: string;
  bridgingDisabled?: true;
  hideAlertMessage?: true;
  learnMoreUrl?: string;
  l1BridgeAddress?: string;
  l2BridgeAddress?: string;
  bridges: {
    label: string;
    iconUrl: string;
    depositUrl?: string;
    withdrawUrl?: string;
  }[];
};

export const customBridgeTokens: CustomBridgeToken[] = [];

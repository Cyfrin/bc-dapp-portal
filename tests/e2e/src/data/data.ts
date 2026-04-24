export enum Extension {
  specifiedExtensionUrl = "chrome-extension://",
  allExtensionsUrl = "chrome://extensions/",
  metamaskHomeHtml = "/home.html",
  metamaskInitialize = "#initialize/welcome",
  metamaskAdvSettings = "#settings/advanced",
  metamaskNetworkSettings = "#settings/networks",
}

export enum NetworkSwitcher {
  battleChainEraGoerli = "/?network=era-goerli",
  battleChainEraMainnet = "/?network=era-mainnet",
}

export enum Routes {
  withdraw = "/transaction/battlechain/era/withdraw",
  deposit = "/transaction/battlechain/era/deposit",
  txBlockExplorer = "https://goerli.explorer.battlechain.com/tx",
}

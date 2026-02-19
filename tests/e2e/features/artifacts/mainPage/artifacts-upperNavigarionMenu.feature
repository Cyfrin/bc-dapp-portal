@upperNavigationMenu @artifacts @regression @mainPage
Feature: Artifacts - Upper Navigation Menu

  Background:
    Given Connect Metamask extension with login action

  @id1530
  Scenario: Check artifacts on the Upper navigation menu (Build)
    Given I am on the Main page
    When I hover the "text" element with " Build " value
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/building-on-battlechain/hello-world.html' and 'Quickstart'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/building-on-battlechain/hello-world.html' and 'Quickstart'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/' and 'Documentation'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/' and 'Documentation'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/api/api.html' and 'Web3 API'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/api/api.html' and 'Web3 API'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/building-on-battlechain/contracts/contract-deployment.html' and 'Contract deployment'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/building-on-battlechain/contracts/contract-deployment.html' and 'Contract deployment'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/developer-guides/bridging/bridging-asset.html' and 'Bridging assets'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/developer-guides/bridging/bridging-asset.html' and 'Bridging assets'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/tutorials/custom-aa-tutorial.html' and 'Account abstraction'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/tutorials/custom-aa-tutorial.html' and 'Account abstraction'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/tutorials/custom-paymaster-tutorial.html' and 'Building custom Paymasters'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/tutorials/custom-paymaster-tutorial.html' and 'Building custom Paymasters'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/tutorials/cross-chain-tutorial.html' and 'Cross-chain governance'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/tutorials/cross-chain-tutorial.html' and 'Cross-chain governance'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/api/js' and 'Javascript SDK'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/api/js' and 'Javascript SDK'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/api/hardhat' and 'Hardhat plugins'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/api/hardhat' and 'Hardhat plugins'" should be "clickable"
    Then Element with "href and text" "'https://era.battlechain.com/docs/api/tools/battlechain-cli/' and 'Battle Chain CLI'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/api/tools/battlechain-cli/' and 'Battle Chain CLI'" should be "clickable"
    Then Element with "partial text" "Guides" should be "visible"
    Then Element with "partial text" "Tools" should be "visible"

  @id1529
  Scenario: Check artifacts on the Upper navigation menu (Learn)
    Given I am on the Main page
    When I hover the "text" element with " Learn " value
    Then Element with "href and text" "'https://battlechain.com/ethos' and 'Freedom is our mission'" should be "visible"
    Then Element with "href and text" "'https://battlechain.com/ethos' and 'Freedom is our mission'" should be "clickable"
    Then Element with "href and text" "'https://battlechain.com/hyperscalability' and 'Hyperscalibility'" should be "visible"
    Then Element with "href and text" "'https://battlechain.com/hyperscalability' and 'Hyperscalibility'" should be "clickable"
    Then Element with "href and text" "'https://battlechain.com/security' and 'Security'" should be "visible"
    Then Element with "href and text" "'https://battlechain.com/security' and 'Security'" should be "clickable"
    Then Element with "href and text" "'https://battlechain.com/ux' and 'Game-changing UX'" should be "visible"
    Then Element with "href and text" "'https://battlechain.com/ux' and 'Game-changing UX'" should be "clickable"

  @id1531
  Scenario: Check artifacts on the Upper navigation menu (Network)
    Given I am on the Main page
    When I hover the "text" element with " Network " value
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/fundamentals/battleChain.html' and 'Intro to Battle Chain'" should be "visible"
    Then Element with "href and text" "'https://era.battlechain.com/docs/dev/fundamentals/battleChain.html' and 'Intro to Battle Chain'" should be "clickable"
    Then Element with "href and text" "'https://portal.battlechain.com/' and 'Wallet Portal'" should be "visible"
    Then Element with "href and text" "'https://portal.battlechain.com/' and 'Wallet Portal'" should be "clickable"
    Then Element with "href and text" "'https://explorer.battlechain.com/' and 'Block Explorer'" should be "visible"
    Then Element with "href and text" "'https://explorer.battlechain.com/' and 'Block Explorer'" should be "clickable"
    Then Element with "href and text" "'https://docs.battlechain.com/userdocs/intro/' and 'Intro to Battle Chain Lite'" should be "visible"
    Then Element with "href and text" "'https://docs.battlechain.com/userdocs/intro/' and 'Intro to Battle Chain Lite'" should be "clickable"
    Then Element with "href and text" "'https://lite.battlechain.com/' and 'Wallet Portal'" should be "visible"
    Then Element with "href and text" "'https://lite.battlechain.com/' and 'Wallet Portal'" should be "clickable"
    Then Element with "href and text" "'https://zkscan.io/' and 'Block Explorer'" should be "visible"
    Then Element with "href and text" "'https://zkscan.io/' and 'Block Explorer'" should be "clickable"
    Then Element with "href and text" "'https://ecosystem.battlechain.com/' and 'Explore the Ecosystem'" should be "visible"
    Then Element with "href and text" "'https://ecosystem.battlechain.com/' and 'Explore the Ecosystem'" should be "clickable"
    Then Element with "href and text" "'https://matterlabs.notion.site/battleChain-Brand-Resources-750bb7b1f3d14ebe9f539a86901c4a1c/' and 'Brand assets'" should be "visible"
    Then Element with "href and text" "'https://matterlabs.notion.site/battleChain-Brand-Resources-750bb7b1f3d14ebe9f539a86901c4a1c/' and 'Brand assets'" should be "clickable"
    Then Element with "partial text" "Battle Chain (v2)" should be "visible"
    Then Element with "partial text" "Battle Chain Lite (v1)" should be "visible"
    Then Element with "partial text" "Battle Chain Lite (v1)" should be "visible"
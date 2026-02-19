@redirection @regression @loginPage @authorized @smoke

Feature: External Redirection on the Login Page

  @id1541
  Scenario Outline: Check redirection for the "View on Explorer" links (Battle Chain∎)
    When I click by "<Selector type>" with "<Selector value>" value
    Then New page has "<url>" address

    Examples:
      | Selector type | Selector value            | url                                        |
      | title         | Battle Chain Portal GitHub page | https://github.com/matter-labs/dapp-portal |
      | id            | zk-sync-white-total       | https://battlechain.com/                         |

  @id1586
  Scenario Outline: Check redirection for the Header links
    When I click by "<Selector type>" with "<Selector value>" value
    Then New page has "<url>" address

    Examples:
      | Selector type | Selector value      | url                                                               |
      | id            | zk-sync-white-total | https://battlechain.com/                                                |
      | aria-label    | Blog                | https://battlechain.mirror.xyz/                                        |
      | aria-label    | Discord Community   | https://join.battlechain.com/                                          |
      | aria-label    | Telegram Support    | https://t.me/zksync                                               |
      | aria-label    | Twitter Community   | https://twitter.com/i/flow/login?redirect_after_login=%2Fzksync   |
      | aria-label    | Email               | https://battlechain.com/contact                                         |
      
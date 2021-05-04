# cryptometa

> Public repository used by ViewBlock to display token information and compute score

### How to use in your app

Thanks to our auto-updated CDN, you can add any chain and token icons in your app seamlessly
using the following url:

    https://meta.viewblock.io/{key}/logo

The key accepts different formats `chainSymbol`, `chainName`, `chainSymbol.tokenHash`, for example:

    <img src="https://meta.viewblock.io/BTC/logo" />
    <img src="https://meta.viewblock.io/zilliqa/logo" />
    <img src="https://meta.viewblock.io/AR.usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A/logo" />

The CDN will automatically route to the right icon, SVG if existing or PNG fallback.

Another cool thing is our dark support. Let's say you have a dark theme,
we have some icons specially made for this case. You simply need to add the `?t=dark` query parameter:

    <img src="https://meta.viewblock.io/AR.usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A/logo?t=dark" />

If the image has a dark alternative, that's what you will get otherwise it will fallback to the default one.

### Specification

| Param               | Type     | Required | Points | Notes                                                                         |
| ------------------- | -------- | -------- | ------ | ----------------------------------------------------------------------------- |
| name                | `String` | `true`   |        |                                                                               |
| symbol              | `String` | `true`   |        |                                                                               |
| web                 | `String` | `false`  | 5      |                                                                               |
| decimals            | `Number` | `false`  |        |                                                                               |
| supply              | `Number` | `false`  |        |                                                                               |
| email               | `String` | `false`  |        | Email of the team                                                             |
| whitepaper          | `String` | `false`  | 10     | Link to the WP                                                                |
| holders             | `Bool`   | `false`  | 10     | Only specify if more than 1000 holders without airdrops                       |
| publicTeam          | `Bool`   | `false`  | 20     | Teams members with public profiles, non-anon                                  |
| product             | `Bool`   | `false`  | 30     | Usable product on mainnet with decent activity and users giving token utility |
| links.research      | `String` | `false`  | 10     | Either binance research, TokenData or the like                                |
| links.github        | `String` | `false`  | 10     | Org or account with repos related to the project                              |
| links.linkedin      | `String` | `false`  | 10     |                                                                               |
| links.twitter       | `String` | `false`  | 5      |                                                                               |
| links.coinmarketcap | `String` | `false`  |        |                                                                               |
| links.coingecko     | `String` | `false`  |        |                                                                               |
| links.medium        | `String` | `false`  |        |                                                                               |
| links.blog          | `String` | `false`  |        |                                                                               |
| links.telegram      | `String` | `false`  |        |                                                                               |
| links.discord       | `String` | `false`  |        |                                                                               |
| links.facebook      | `String` | `false`  |        |                                                                               |
| links.reddit        | `String` | `false`  |        |                                                                               |
| links.youtube       | `String` | `false`  |        |                                                                               |
| links.instagram     | `String` | `false`  |        |                                                                               |
| donations           | `Object` | `false`  |        | `{ "ethereum": "0x...", "zilliqa": "zil1..."}`                                |

Upon disagreements as to which property a token has/deserves, remember that we
ultimately have the final say in order to protect people as much as we can.

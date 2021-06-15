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

### How to add/update your token

- Fork the repo
- Create a folder in the appropriate chain folder named after your contract address
- Your image must be either SVG or PNG 100x100 to 500x500 (max 40kb) and named `logo.<extension>` (do not base64 encode your PNG in a SVG)
- Add information of your project using the following spec:

| Param               | Type     | Required   | Points  | Notes                                                     |
| ------------------- | -------- | ---------- | ------- | --------------------------------------------------------- |
| name      “SHARK”   | `String` | `true`     |         |                                                           |
| symbol    “$SHRK”   | `String` | `true`     |         |                                                           |
| web                 | `String` | `false`    | 5       | https://viewblock.io/zilliqa/address/zil17tsmlqgnzlfxsq4evm6n26txm2xlp5hele0kew                                                          |
| decimals   “6”      | `Number` | `false`    |         |                                                           |
| supply     “420m”   | `Number` | `false`    |         |                                                           |
| email               | `String` | `false`    |         | shrkfinancial@gmail.com                                   |
| whitepaper          | `String` | `false`    | 10      | https://github.com/FintechLabZ/SHRK-RoadMap               |
| holders             | `Bool`   | `false`    | 10      | “zil1vtjutgxcgn75g7279ncflxk6gh9j8gshcav0hd”    |
                                                          “zil109vuy7hj9epl4zxse09vy6wrt04ytkcmw438zy”
                                                          “zil1yeh7jpv20savtd3katuj9zk2hu57um75jdsysz
                                                          “zil1eadtael94ezfqesgzngfprk7lt4x5a7cslan0t
| publicTeam          | `Bool`   | `false`    | 20      |  https://twitter.com/3fintony1                            |
| product             | `Bool`   | `false`    | 30      | Usable product on mainnet with decent activity and users giving token utility |
| links.research      | `String` | `false`    | 10      | Either binance research, TokenData or the like            |
| links.github        | `String` | `false`    | 10      | https://github.com/3FinTony                               |
| links.linkedin      | `String` | `false`    | 10      |                                                           |
| links.twitter       | `String` | `false`    | 5       | https://twitter.com/sharkfinancial                        |
| links.coinmarketcap | `String` | `false`    |         |                                                           |
| links.coingecko     | `String` | `false`    |         |                                                           |
| links.medium        | `String` | `false`    |         | https://sharkfinprotocol.medium.com/sharkfinprotocol      |
| links.blog          | `String` | `false`    |         |                                                           |
| links.telegram      | `String` | `false`    |         |                                                           |
| links.discord       | `String` | `false`    |         |                                                           |
| links.facebook      | `String` | `false`    |         |                                                           |
| links.reddit        | `String` | `false`    |         |                                                           |
| links.youtube       | `String` | `false`    |         |                                                           |
| links.instagram     | `String` | `false`    |         |                                                           |
| donations           | `Object` | `false`    |         | `{ "ethereum": "0x...", "zilliqa": "zil1..."}`            |

- No need to calculate and specify the score yourself, as it will be automatically
  generated based on the provided properties
- Create and submit a PR

Upon disagreements as to which property a token has/deserves, remember that we
ultimately have the final say in order to protect people as much as we can.

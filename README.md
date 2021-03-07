# cryptometa

> Public repository used by ViewBlock to display token information and compute score

#### How to add/update your token

- Fork the repo
- Create a folder in the appropriate chain folder named after your contract address
- Your image must be either SVG or PNG 256x256 (max 100kb) and named `logo.<extension>` (do not base64 encode your PNG in a SVG)
- Add information of your project using the following spec:

| Param               | Type     | Required   | Points  | Notes                                                     |
| ------------------- | -------- | ---------- | ------- | --------------------------------------------------------- |
| name                | `String` | `true`     |         |                                                           |
| symbol              | `String` | `true`     |         |                                                           |
| web                 | `String` | `false`    | 5       |                                                           |
| decimals            | `Number` | `false`    |         |                                                           |
| supply              | `Number` | `false`    |         |                                                           |
| email               | `String` | `false`    |         | Email of the team                                         |
| whitepaper          | `String` | `false`    | 10      | Link to the WP                                            |
| holders             | `Bool`   | `false`    | 10      | Only specify if more than 1000 holders without airdrops   |
| publicTeam          | `Bool`   | `false`    | 20      | Teams members with public profiles, non-anon              |
| product             | `Bool`   | `false`    | 30      | Usable product on mainnet with users giving token utility |
| links.research      | `String` | `false`    | 10      | Either binance research, TokenData or the like            |
| links.github        | `String` | `false`    | 10      | Org or account with repos related to the project          |
| links.linkedin      | `String` | `false`    | 10      |                                                           |
| links.twitter       | `String` | `false`    | 5       |                                                           |
| links.coinmarketcap | `String` | `false`    |         |                                                           |
| links.coingecko     | `String` | `false`    |         |                                                           |
| links.medium        | `String` | `false`    |         |                                                           |
| links.blog          | `String` | `false`    |         |                                                           |
| links.telegram      | `String` | `false`    |         |                                                           |
| links.discord       | `String` | `false`    |         |                                                           |
| links.facebook      | `String` | `false`    |         |                                                           |
| links.reddit        | `String` | `false`    |         |                                                           |
| links.youtube       | `String` | `false`    |         |                                                           |
| links.instagram     | `String` | `false`    |         |                                                           |

- No need to calculate and specify the score yourself, as it will be automatically
  generated based on the provided properties
- Create and submit a PR

Upon disagreements as to which property a token has/deserves, remember that we
ultimately have the final say in what gets to show in our products.

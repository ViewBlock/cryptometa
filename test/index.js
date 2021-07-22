const test = require('ava')

const { setConfig, getMeta } = require('../src')
const { loadFull } = require('../bin/utils')

// setConfig({
//   getData: loadFull,
// })

test('Chain symbol', async t => {
  const eth = await getMeta('ETH')

  t.is(eth.symbol, 'ETH')
  t.is(eth.name, 'Ethereum')
})

test('Unknown', async t => {
  const rip = await getMeta('CRIPPLE')
  t.falsy(rip.name)
})

test('Chain name', async t => {
  const eth = await getMeta('ethereum')
  t.is(eth.symbol, 'ETH')
})

test('Dot notation', async t => {
  const eth = await getMeta('ETH.ethereum')
  t.is(eth.symbol, 'ETH')

  const eth2 = await getMeta('ETH.ETH')
  t.is(eth2.symbol, 'ETH')

  const unknown = await getMeta('AR.BTC')
  t.falsy(unknown.symbol)

  const btc = await getMeta('BTC.BTC')
  t.is(btc.name, 'Bitcoin')

  const thor1 = await getMeta('THOR')
  t.is(thor1.name, 'Thorchain')
})

test('Unique asset', async t => {
  const flip = await getMeta('ZIL.zil1r9dcsrya4ynuxnzaznu00e6hh3kpt7vhvzgva0')

  t.is(flip.symbol, 'ZLF')
  t.truthy(flip.links)
})

test('Multi', async t => {
  const data = await getMeta(['BNB.AVA-645', 'binance.AVA-645'])

  t.is(data.length, 2)
  t.is(data[0].symbol, 'AVA-645')
})

test('Selection', async t => {
  const eth = await getMeta('ETH', 'logo web')

  const ethLogo =
    'https://raw.githubusercontent.com/Ashlar/cryptometa/master/data/ethereum/logo.svg'

  t.deepEqual(eth, {
    logo: ethLogo,
    web: 'https://ethereum.org',
  })

  const multi = await getMeta(['BNB.AVA-645', 'ETH.ETH'], 'logo')

  t.is(multi.length, 2)
  t.is(typeof multi[0], 'string')
  t.is(multi[1], ethLogo)
})

test('Linked assets', async t => {
  // const eth = await getMeta('BNB.ETH-1C9')
  // t.is(eth.name, 'Ethereum')
  // t.is(eth.symbol, 'ETH')
  // t.is(eth.explorer, 'https://etherscan.io')

  const bsc = await getMeta('BSC')
  t.is(bsc.name, 'Binance Chain')

  const huobi = await getMeta('huobi')
  t.is(huobi.name, 'Huobi Token')
  t.truthy(huobi.links)

  const thor2 = await getMeta('THOR.RUNE')
  t.is(thor2.name, 'Thorchain')

  const thor3 = await getMeta('RUNE')
  t.is(thor3.name, 'Thorchain')
})

test('Aliases', async t => {
  const token = await getMeta('zilliqa.zil1zu72vac254htqpg3mtywdcfm84l3dfd9qzww8t')

  t.truthy(token.trusted)
  t.is(
    token.logo,
    'https://raw.githubusercontent.com/Ashlar/cryptometa/master/data/zilliqa/assets/zil180v66mlw007ltdv8tq5t240y7upwgf7djklmwh/logo.svg',
  )
})

test('Unicly', async t => {
  const token = await getMeta('ethereum.0xaffdb768e5f909b9a6ed110ad724b5e454670c08')
  t.is(token.symbol, 'uJORDAN')
})

test.serial('Custom image base', async t => {
  setConfig({
    base: 'https://google.com',
  })

  const res = await getMeta('BNB')
  t.is(res.logo, 'https://google.com/data/binance/logo.svg')
})

test.serial('Custom getData', async t => {
  setConfig({
    base: null,
    getData: async () => {
      return {
        _chains: { binance: 'BNB' },
        _symbols: { BNB: 'binance' },
        binance: { name: 'Yolo', path: 'binance', symbol: 'BNB' },
      }
    },
  })

  const res = await getMeta('BNB.BNB')

  t.is(res.name, 'Yolo')

  setConfig({
    base: null,
    getData: null,
  })
})

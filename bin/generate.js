const { join } = require('path')
const merge = require('lodash/merge')

const { BASE, DEFAULT_IMG } = require('../src/config')
const { get } = require('../src/utils')
const { checkDark } = require('./colors')
const { toImg, loadFull, exec, readdir, readFile, writeFile } = require('./utils')

const ROOT = join(__dirname, '../data')

const relativePath = path => path.replace(`${ROOT}/`, '')

const readMeta = async path => {
  try {
    const contents = await readFile(path, 'utf-8')
    return JSON.parse(contents)
  } catch {
    throw new Error(`Invalid meta at ${relativePath(path)}`)
  }
}

const whitescale = async (path, output) =>
  exec(`convert ${path} -channel RGB -fuzz 99% -fill white -opaque black ${output}`)

const scoreItems = {
  web: 5,
  'links.twitter': 5,
  'links.linkedin': 5,
  'links.github': 10,
  'links.research': 10,
  whitepaper: 10,
  holders: 10,
  publicTeam: 20,
  product: 30,
}

const maxScore = Object.keys(scoreItems).reduce((acc, key) => acc + scoreItems[key], 0)

const getScore = data => {
  if (data.trusted) {
    return 100
  }

  const score = Object.keys(scoreItems).reduce(
    (acc, key) => acc + (get(data, key) ? scoreItems[key] : 0),
    0,
  )

  return Math.round((score / maxScore) * 100)
}

const updateMeta = async (path, { skipScore } = {}) => {
  const files = await readdir(path)
  const metaPath = join(path, 'meta.json')
  const meta = await readMeta(metaPath)

  const logoName = files.find(file => file.startsWith('logo.'))
  const logoDark = files.find(f => f.startsWith('logo-white.'))
  const logo = logoName ? `${BASE}/${relativePath(path)}/${logoName}` : DEFAULT_IMG
  const isSVG = logoName && logoName.endsWith('svg')

  let hasFallback = false
  let hasDark = logoDark && logoDark === 'logo-white.svg'

  if (isSVG && !hasDark) {
    try {
      await writeFile(join(path, 'fallback.png'), await toImg(join(path, logoName)))
      hasFallback = true
    } catch {}
  }

  if (
    logoName &&
    (!isSVG || hasFallback) &&
    get(meta, 'config.dark') !== false &&
    !get(meta, 'config.manualDark')
  ) {
    const imgPath = isSVG ? join(path, 'fallback.png') : join(path, logoName)
    const isDark = await checkDark(imgPath)

    if (isDark || get(meta, 'config.dark')) {
      await whitescale(imgPath, join(path, 'logo-white.png'))
      hasDark = true
    } else {
      await exec(`rm -f ${path}/logo-white.*`)
    }
  }

  const out = {
    ...meta,

    config: meta.config && Object.keys(meta.config).length ? meta.config : undefined,

    gen: {
      logo: logoName,
      hasDark: get(meta, 'config.manualDark', false) || hasDark,
      darkExt: logoDark && logoDark.split('.')[1] !== 'png' ? logoDark.split('.')[1] : undefined,
      score: skipScore ? undefined : getScore(meta),
    },
  }

  await writeFile(metaPath, JSON.stringify(out, null, 2))

  return out
}

const main = async () => {
  const chains = (await readdir(ROOT)).filter(d => !d.includes('.'))

  const filters = process.argv[2] && process.argv[2].split('/')

  const full = merge(await loadFull(), {
    _symbols: {},
    _chains: {},
    _remap: {
      bsc: 'binance',
      huobi: 'ethereum.0x6f259637dcd74c767781e37bc6133cd6a68aa161',
      chiliz: 'ethereum.0x3506424f91fd33084466f402d5d97f05f8e3b4af',
      polygon: 'ethereum.0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
      waves: 'ethereum.0x1cf4592ebffd730c7dc92c1bdffdfc3b9efcf29a',

      RUNE: 'thorchain',
      'THOR.RUNE': 'thorchain',
      // 'binance.ETH-1C9': 'ethereum',
    },
  })

  for (const chain of chains) {
    if (full._remap[chain] || (filters && filters[0] !== chain)) {
      continue
    }

    const path = join(ROOT, chain)
    const files = await readdir(path)

    const meta = await updateMeta(path, { skipScore: true })
    full[chain] = { ...meta, config: undefined }

    full._chains[chain] = meta.symbol
    full._symbols[meta.symbol] = chain

    if (files.includes('assets')) {
      const assets = await readdir(join(path, 'assets'))
      const assetsLength = assets.length

      for (let i = 0; i < assetsLength; ++i) {
        const hash = assets[i]
        if (
          full._remap[`${chain}.${hash}`] ||
          (filters && filters[1] && !hash.includes(filters[1]))
        ) {
          continue
        }

        const meta = await updateMeta(join(path, `assets/${hash}`))
        console.log(
          `[${chain}:${meta.symbol || meta.name || hash}] ${i}/${assetsLength} (${(
            (i / assetsLength) *
            100
          ).toFixed(2)}%)`,
        )

        full[`${chain}.${hash}`] = { ...meta, config: undefined }
      }
    }
  }

  await writeFile(join(__dirname, '../src/full.json'), JSON.stringify(full))

  await exec('rm -f data/***/fallback.png')
}

main()

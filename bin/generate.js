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
    throw new Error(`Invalid meta at data/${relativePath(path)}`)
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

  const skipsByKey = (get(data, 'config.scoreSkip') || []).reduce(
    (acc, k) => ((acc[k] = true), acc),
    {},
  )

  const score = Object.keys(scoreItems).reduce(
    (acc, key) => acc + (get(data, key) && !skipsByKey[key] ? scoreItems[key] : 0),
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

const arg = process.argv[2]

const getFilters = async () => {
  if (!arg) {
    const res = await exec('git diff --name-only HEAD HEAD~1')

    return res.stdout
      .split('\n')
      .filter(f => f && f.startsWith('data') && f.endsWith('.json'))
      .reduce((acc, d) => {
        const splits = d.split('/')

        if (!acc[splits[1]]) {
          acc[splits[1]] = {}
        }

        acc[splits[1]][splits[3]] = 1

        return acc
      }, {})
  }

  if (arg === 'all') {
    return null
  }

  const splits = arg.split('/')

  return {
    [splits[0]]: {
      [splits[1]]: 1,
    },
  }
}

const main = async () => {
  const chains = (await readdir(ROOT)).filter(d => !d.includes('.'))

  const filters = await getFilters()

  const full = merge(await loadFull(), {
    _symbols: {},
    _chains: {},
  })

  full._remap = {
    bsc: 'binance',
    huobi: 'ethereum.0x6f259637dcd74c767781e37bc6133cd6a68aa161',
    chiliz: 'ethereum.0x3506424f91fd33084466f402d5d97f05f8e3b4af',
    // polygon: 'ethereum.0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    waves: 'ethereum.0x1cf4592ebffd730c7dc92c1bdffdfc3b9efcf29a',

    RUNE: 'thorchain',
    'THOR.RUNE': 'thorchain',
    // 'binance.ETH-1C9': 'ethereum',
  }

  for (const chain of chains) {
    if (filters !== null && (full._remap[chain] || !filters[chain])) {
      continue
    }

    const path = join(ROOT, chain)
    const files = await readdir(path)

    const meta = await updateMeta(path, { skipScore: true })
    full[chain] = { ...meta, config: undefined }

    full._chains[chain] = meta.symbol
    full._symbols[meta.symbol] = chain

    const allKeys = Object.keys(full)

    if (files.includes('assets')) {
      const assets = await readdir(join(path, 'assets'))
      const assetsLength = assets.length
      const assetKeys = assets.reduce((acc, hash) => ((acc[`${chain}.${hash}`] = true), acc), {})
      const currentAssets = allKeys.filter(k => k.startsWith(`${chain}.`))

      currentAssets.forEach(k => {
        if (!assetKeys[k] && !full[k]._target) {
          delete full[k]
        }
      })

      for (let i = 0; i < assetsLength; ++i) {
        const hash = assets[i]
        if (
          full._remap[`${chain}.${hash}`] ||
          (!get(filters, `${chain}.${hash}`) && !get(filters, `${chain}.undefined`))
        ) {
          continue
        }

        const meta = await updateMeta(join(path, `assets/${hash}`))

        const progress = arg
          ? ` ${i}/${assetsLength} (${((i / assetsLength) * 100).toFixed(2)}%)`
          : ''

        console.log(
          `[${chain}:${meta.symbol || meta.name || hash}]${progress} [${meta.gen.score}/100 ⭐]`,
        )

        if (meta.aliases && meta.aliases.length) {
          const aliasPayload = { _target: `${chain}.${hash}` }

          meta.aliases
            .filter(f => f)
            .forEach(alias => {
              const [first, second] = alias.split('.')
              full[second ? `${first}.${second}` : first] = aliasPayload
            })
        }

        full[`${chain}.${hash}`] = { ...meta, aliases: undefined, config: undefined }
      }
    }
  }

  await writeFile(join(__dirname, '../src/full.json'), JSON.stringify(full))

  await exec('rm -f data/***/fallback.png')
}

main()

const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const svg2img = require('svg2img')
const cp = require('child_process')

const { BASE, DEFAULT_IMG } = require('../src/config')
const { get } = require('../src/utils')
const { checkDark } = require('./colors')

const ROOT = join(__dirname, '../data')

const [readdir, writeFile, readFile] = ['readdir', 'writeFile', 'readFile'].map(name =>
  promisify(fs[name]),
)

const toImg = promisify(svg2img)
const exec = promisify(cp.exec)

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
  const logo = logoName ? `${BASE}/${relativePath(path)}/${logoName}` : DEFAULT_IMG
  const isSVG = logoName && logoName.endsWith('svg')

  let hasFallback = false
  let hasDark = false

  if (isSVG) {
    try {
      await writeFile(join(path, 'fallback.png'), await toImg(join(path, logoName)))
      hasFallback = true
    } catch {}
  }

  if (logoName && (!isSVG || hasFallback) && get(meta, 'config.dark') !== false) {
    const imgPath = isSVG ? join(path, 'fallback.png') : join(path, logoName)
    const isDark = await checkDark(imgPath)

    if (isDark || get(meta, 'config.dark')) {
      await whitescale(imgPath, join(path, 'logo-white.png'))
      hasDark = true
    }
  }

  const out = {
    ...meta,

    config: meta.config && Object.keys(meta.config).length ? meta.config : undefined,

    gen: {
      logo: logoName,
      hasDark,
      score: skipScore ? undefined : getScore(meta),
    },
  }

  writeFile(metaPath, JSON.stringify(out, null, 2))

  return out
}

const main = async () => {
  await exec('rm -f ../data/***/logo-white.png')

  const chains = (await readdir(ROOT)).filter(d => !d.includes('.'))

  const full = {}
  const mapping = {}

  for (const chain of chains) {
    const path = join(ROOT, chain)
    const files = await readdir(path)

    const meta = await updateMeta(path, { skipScore: true })
    full[chain] = { ...meta, config: undefined }

    const lower = meta.path || meta.name.toLowerCase()
    mapping[lower] = 1
    mapping[meta.symbol] = meta.path || lower

    if (files.includes('assets')) {
      const assets = await readdir(join(path, 'assets'))

      await Promise.all(
        assets.map(async hash => {
          const meta = await updateMeta(join(path, `assets/${hash}`))
          full[`${chain}.${hash}`] = { ...meta, config: undefined }
        }),
      )
    }
  }

  writeFile(join(__dirname, '../src/mapping.json'), JSON.stringify(mapping))
  writeFile(join(__dirname, '../src/full.json'), JSON.stringify(full))

  await exec('rm -f data/***/fallback.png')
}

main()

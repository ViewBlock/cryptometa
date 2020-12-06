require('isomorphic-fetch')

const { ROOT, BASE, DEFAULT_IMG, CACHE_DURATION } = require('./config')
const { getParams, transformData } = require('./utils')

const cache = {
  data: null,
  ts: null,
  fetching: false,
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const getData = async () => {
  if (cache.fetching) {
    return sleep(500).then(getData)
  }

  if (cache.ts && Date.now() - cache.ts <= CACHE_DURATION) {
    return cache.data
  }

  cache.fetching = true

  const data = await fetch(`${ROOT}/src/full.json`).then(r => r.json())

  cache.ts = Date.now()
  cache.data = data
  cache.fetching = false

  return data
}

module.exports = async (payload, select) => {
  const data = await getData()

  const params = Array.isArray(payload) ? payload : [payload]

  const out = params.map(key => {
    const [chain, assetKey] = getParams(key)

    return transformData(data[`${chain}${assetKey ? `.${assetKey}` : ''}`], {
      chain,
      assetKey,
      select,
    })
  })

  if (!Array.isArray(payload)) {
    return out[0]
  }

  return out
}

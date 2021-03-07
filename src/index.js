require('isomorphic-fetch')

const { ROOT, CACHE_DURATION } = require('./config')
const { getParams, transformData } = require('./utils')

const config = {
  cacheDuration: CACHE_DURATION,
}

const cache = {
  data: null,
  ts: null,
  fetching: false,
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const refreshData = async () => {
  cache.fetching = true

  const data = await fetch(`${ROOT}/src/full.json`).then(r => r.json())

  cache.data = data
  cache.ts = Date.now()
  cache.fetching = false
}

const _getData = async () => {
  if (cache.fetching) {
    return sleep(500).then(_getData)
  }

  if (cache.ts && Date.now() - cache.ts <= config.cacheDuration) {
    return cache.data
  }

  await refreshData()

  return cache.data
}

module.exports = {
  setConfig: payload => {
    Object.keys(payload).forEach(key => {
      config[key] = payload[key]
    })
  },

  getMeta: async (payload, select) => {
    const getData = config.getData || _getData
    const data = await getData()

    const params = Array.isArray(payload) ? payload : [payload]

    const out = params.map(key => {
      const [chain, assetKey] = getParams(key, data)

      return transformData(data[`${chain}${assetKey ? `.${assetKey}` : ''}`], {
        chain,
        assetKey,
        select,

        base: config.base ? `${config.base}/data` : null,
        defaultImg: config.base ? `${config.base}/data/default.png` : null,
      })
    })

    if (!Array.isArray(payload)) {
      return out[0]
    }

    return out
  },
}

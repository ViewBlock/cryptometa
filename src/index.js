require('isomorphic-fetch')

const { BASE } = require('./config')
const { transformData, getParams } = require('./utils')

module.exports = (payload, select) => {
  const params = Array.isArray(payload) ? payload : [payload]

  return Promise.all(
    params.map(key => {
      const [chain, assetKey] = getParams(key)

      return fetch(`${BASE}/${chain}${assetKey ? `/assets/${assetKey}` : ''}/meta.json`)
        .then(r => r.json())
        .then(data => transformData(data, { chain, assetKey, select }))
    }),
  ).then(out => {
    if (!Array.isArray(payload)) {
      return out[0]
    }

    return out
  })
}

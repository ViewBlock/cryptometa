const { BASE, DEFAULT_IMG } = require('./config')
const mapping = require('./mapping.json')

const get = (obj, path, defaultValue) => {
  const res = path.split('.').reduce((acc, key) => (acc ? acc[key] : null), obj)

  if (res === undefined) {
    return defaultValue
  }

  return res
}

const filter = (obj, select) => {
  if (!select) {
    return obj
  }

  const fields = select.split(' ')

  if (fields.length === 1) {
    return get(obj, fields[0])
  }

  return fields.reduce((acc, field) => {
    acc[field] = get(obj, field)
    return acc
  }, {})
}

const transformData = (meta, { chain, assetKey, select }) => {
  const item = {
    ...meta,
    score: get(meta, 'gen.score'),
    logo: get(meta, 'gen.logo')
      ? `${BASE}/${chain}${assetKey ? `/assets/${assetKey}` : ''}/${get(meta, 'gen.logo')}`
      : DEFAULT_IMG,
    logoDark: get(meta, 'gen.hasDark')
      ? `${BASE}/${chain}${assetKey ? `/assets/${assetKey}` : ''}/logo-white.png`
      : undefined,
    gen: undefined,
  }

  for (const key of Object.keys(item)) {
    if (item[key] === undefined) {
      delete item[key]
    }
  }

  return filter(item, select)
}

const getParams = key => {
  const [chainKey, assetKey] = Array.isArray(key) ? key : key.split('.')
  const chain = mapping[chainKey] === 1 ? chainKey : mapping[chainKey]

  return [chain, assetKey]
}

module.exports = {
  get,
  transformData,
  getParams,
}

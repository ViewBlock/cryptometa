const { BASE, DEFAULT_IMG } = require('./config')

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

const transformData = (
  meta,
  {
    chain,
    assetKey,
    select,

    base,
    defaultImg,
  },
) => {
  const item = {
    ...meta,
    score: get(meta, 'gen.score'),
    logo: get(meta, 'gen.logo')
      ? `${base || BASE}/${chain}${assetKey ? `/assets/${assetKey}` : ''}/${get(meta, 'gen.logo')}`
      : defaultImg || DEFAULT_IMG,
    logoDark: get(meta, 'gen.hasDark')
      ? `${base || BASE}/${chain}${assetKey ? `/assets/${assetKey}` : ''}/logo-white.${get(
          meta,
          'gen.darkExt',
          'png',
        )}`
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

const getParams = (key, data) => {
  const [chainKey, assetKey] = Array.isArray(key) ? key : key.split('.')

  if (!data) {
    return [chainKey, assetKey]
  }

  const chain = data._symbols[chainKey] ? data._symbols[chainKey] : chainKey

  const remapKey =
    data._remap &&
    ((!assetKey && (data._remap[chainKey.toLowerCase()] || data._remap[chainKey])) ||
      (assetKey && (data._remap[key] || data._remap[key] || data._remap[`${chain}.${assetKey}`])))

  if (remapKey) {
    return getParams(remapKey)
  }

  if (chain === assetKey || chain === data._symbols[assetKey]) {
    return [chain]
  }

  return [chain, assetKey]
}

module.exports = {
  get,
  transformData,
  getParams,
}

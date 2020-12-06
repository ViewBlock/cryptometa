const ROOT = 'https://raw.githubusercontent.com/Ashlar/cryptometa/master'
const BASE = `${ROOT}/data`

module.exports = {
  ROOT,
  BASE,
  DEFAULT_IMG: `${BASE}/default.png`,

  // 30 minutes
  CACHE_DURATION: 1e3 * 60 * 30,
}

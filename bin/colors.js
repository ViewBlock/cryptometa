const getPixels = require('image-pixels')
const nearestColor = require('nearest-color')

const COLORS = {
  red: '#DC1A1A',
  orange: '#FF9800',
  yellow: '#FFEB3B',
  green: '#4CAF50',
  teal: '#00BCD4',
  blue: '#2196F3',
  navy: '#05215f',
  purple: '#9C27B0',
  pink: '#FF007F',
  white: '#FFFFFF',
  gray: '#9E9E9E',
  black: '#000000',
  brown: '#5D4037',
}

const COLOR_COUNT = Object.keys(COLORS).length

const VIBRANTS = {
  red: true,
  orange: true,
  yellow: true,
  green: true,
  teal: true,
  blue: true,
  navy: true,
  purple: true,
  pink: true,
}

const DARKS = {
  black: true,
  brown: true,
  gray: true,
  navy: true,
}

const getColorName = nearestColor.from(COLORS)

const getColors = (pixels, pixelCount, skip) => {
  const out = { count: 0 }

  for (let i = 0, offset, r, g, b, a; i < pixelCount; i += skip) {
    offset = i * 4
    r = pixels[offset + 0]
    g = pixels[offset + 1]
    b = pixels[offset + 2]
    a = pixels[offset + 3]

    if (typeof r === 'undefined' || typeof g === 'undefined' || typeof b === 'undefined') {
      continue
    }

    // If pixel is mostly opaque
    if (typeof a === 'undefined' || a >= 125) {
      const { name } = getColorName({ r, g, b })
      if (!out[name]) {
        out[name] = 0
      }

      out[name]++
      out.count++
    }

    if (a && a < 124) {
      if (!out.transparent) {
        out.transparent = 0
      }

      out.transparent++
      out.count++
    }
  }

  return out
}

const getAllColors = async (img, options) => {
  const { width, height, data } = await getPixels(img, options)

  const count = width * height
  // Skip pixels only for big images
  const skip = count < 100 ? 1 : 10

  return getColors(data, count, skip)
}

const getDominantColors = async colors => {
  const threshold = 1 / COLOR_COUNT

  const res = []
  const vibrant = {
    included: false,
    per: 0,
    value: null,
  }

  for (const [key, value] of Object.entries(colors)) {
    if (key === 'count' || key === 'transparent') {
      continue
    }

    const per = value / colors.count
    const isVibrant = VIBRANTS[key]
    const isNewVibrant = isVibrant && per > 0.01 && vibrant.per < per

    if (isNewVibrant) {
      vibrant.value = key
      vibrant.per = per
    }

    if (per < threshold) {
      if (isNewVibrant) {
        vibrant.included = false
      }
    } else {
      res.push(key)
      if (isNewVibrant) {
        vibrant.included = true
      }
    }
  }

  if (res.length) {
    if (vibrant.value && !vibrant.included) {
      return [...res, vibrant.value]
    }

    return res
  }

  // Dumb fallback to just giving the first three colors
  // honestly shouldn't happen too much unless we're talking
  // color samples/rainbows and it won't be relevant anyway
  return Object.keys(colors)
    .filter(k => k !== 'count' && k !== 'transparent')
    .slice(0, 3)
}

const checkDark = async path => {
  try {
    const colors = await getAllColors(path)

    if (!colors.transparent) {
      return false
    }

    if (Object.keys(colors).length > 5) {
      return false
    }

    const dominant = await getDominantColors(colors)

    if (!dominant.length) {
      return false
    }

    return DARKS[dominant[0]] && (!dominant[1] || DARKS[dominant[1]])
  } catch (err) {
    return false
  }
}

module.exports = {
  getAllColors,
  checkDark,
}

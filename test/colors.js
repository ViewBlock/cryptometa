const test = require('ava')
const { join } = require('path')

const { getAllColors, checkDark } = require('../bin/colors')
const { toImg } = require('../bin/utils')

const getImg = subPath => {
  const path = join(__dirname, `../data/${subPath}`)

  if (!subPath.endsWith('.svg')) {
    return path
  }

  return toImg(path)
}

test.serial('ETH should be whitescaled', async t => {
  const img = await getImg('ethereum/logo.svg')
  t.is(await checkDark(img), true)
})

test.serial('0xfffff should not be whitescaled', async t => {
  const img = await getImg('ethereum/assets/0xffffffff2ba8f66d4e51811c5190992176930278/logo.png')
  t.is(await checkDark(img), false)
})

test.serial('stellar', async t => {
  const img = await getImg('stellar/logo.svg')
  t.is(await checkDark(img), true)
})

test.serial('SOL 4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', async t => {
  const img = await getImg('solana/assets/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png')
  t.is(await checkDark(img), false)
})

const fs = require('fs')
const { join } = require('path')
const cp = require('child_process')
const { promisify } = require('util')
const svg2img = require('svg2img')
const axios = require('axios')

const toImg = promisify(svg2img)

const [readdir, writeFile, readFile, exists] = ['readdir', 'writeFile', 'readFile', 'exists'].map(
  name => promisify(fs[name]),
)

const exec = promisify(cp.exec)

const readJSON = async p => {
  try {
    const data = JSON.parse(await readFile(p))
    return data
  } catch {
    return {}
  }
}

const loadFull = () => readJSON(join(__dirname, '../src/full.json'))

const dlImage = (url, path) =>
  axios({ url, responseType: 'stream' }).then(
    response =>
      new Promise((resolve, reject) =>
        response.data.pipe(fs.createWriteStream(path)).on('finish', resolve).on('error', reject),
      ),
  )

module.exports = {
  toImg,
  readJSON,
  loadFull,

  exec,

  readdir,
  writeFile,
  readFile,
  exists,

  dlImage,
}

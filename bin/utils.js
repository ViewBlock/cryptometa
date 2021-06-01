const fs = require('fs')
const { join } = require('path')
const cp = require('child_process')
const { promisify } = require('util')
const svg2img = require('svg2img')

const toImg = promisify(svg2img)

const [readdir, writeFile, readFile] = ['readdir', 'writeFile', 'readFile'].map(name =>
  promisify(fs[name]),
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

module.exports = {
  toImg,
  readJSON,
  loadFull,

  exec,

  readdir,
  writeFile,
  readFile,
}

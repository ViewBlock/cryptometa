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

const loadFull = async () => {
  try {
    const data = JSON.parse(await readFile(join(__dirname, '../src/full.json')))
    return data
  } catch {
    return {}
  }
}

module.exports = {
  toImg,
  loadFull,

  exec,

  readdir,
  writeFile,
  readFile,
}

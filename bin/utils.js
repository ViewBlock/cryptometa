const fs = require('fs')
const cp = require('child_process')
const { promisify } = require('util')
const svg2img = require('svg2img')

const toImg = promisify(svg2img)
const [readdir, writeFile, readFile] = ['readdir', 'writeFile', 'readFile'].map(name =>
  promisify(fs[name]),
)

const exec = promisify(cp.exec)

module.exports = {
  toImg,

  exec,

  readdir,
  writeFile,
  readFile,
}

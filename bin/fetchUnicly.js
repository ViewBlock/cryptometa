const fs = require('fs')
const cp = require('child_process')
const path = require('path')
const axios = require('axios')
const pickBy = require('lodash/pickBy')
const { ethers, InfuraProvider } = require('ethers')

const { exec, readdir, writeFile, promisify } = require('./utils')

const repoPath = '0xLeia/unicly-utoken-info'
const treeURL = `https://api.github.com/repos/${repoPath}/git/trees/main?recursive=1`
const rawURL = `https://raw.githubusercontent.com/${repoPath}/main`

const fns = ['symbol', 'name', 'decimals', '_description']

const abi = fns.map(
  name => `function ${name}() view returns (${name === 'decimals' ? 'uint8' : 'string'})`,
)

const provider = new ethers.providers.InfuraProvider(null, process.env.INFURA)

const main = async () => {
  const { data } = await axios.get(treeURL)

  const files = data.tree.filter(
    t => t.path.startsWith('uTokens/0x') && (t.path.endsWith('.json') || t.path.endsWith('svg')),
  )

  const fileDatas = await Promise.all(
    files.map(file => axios.get(`${rawURL}/${file.path}`).then(({ data }) => data)),
  )

  const contracts = files.reduce((acc, file, i) => {
    const [fileName, h] = file.path.split('/').reverse()
    const hash = h.toLowerCase()

    if (!acc[hash]) {
      acc[hash] = {}
    }

    if (fileName.endsWith('.svg')) {
      acc[hash].logo = fileDatas[i]
    } else {
      acc[hash].data = pickBy(
        {
          description: (fileDatas[i].description || '').trim().replace(/\s\s+/g, ' '),
          website: fileDatas[i].website,

          links: pickBy(
            {
              discord: fileDatas[i].discord,
              medium: fileDatas[i].medium,
              twitter: fileDatas[i].twitter,
              telegram: fileDatas[i].telegram,
            },
            f => f,
          ),
        },
        f => f,
      )
    }

    return acc
  }, {})

  const contractDatas = await Promise.all(
    Object.keys(contracts).map(async hash => {
      const erc20 = new ethers.Contract(hash, abi, provider)
      const datas = await Promise.all(fns.map(name => erc20[name]().catch(() => null)))

      if (!datas[0]) {
        return null
      }

      return pickBy(
        fns.reduce((acc, name, i) => {
          if (name === 'decimals') {
            acc[name] = datas[i]
            return acc
          }

          acc[name.replace(/_/, '')] = (datas[i] || '').trim().replace(/\s\s+/g, ' ')
          return acc
        }, {}),
        f => f,
      )
    }),
  )

  const payload = Object.keys(contracts)
    .filter((key, i) => contractDatas[i])
    .map((key, i) => ({
      key,
      ...contracts[key],
      data: { ...contractDatas[i], ...contracts[key].data },
    }))

  for (const contract of payload) {
    const dir = path.join(__dirname, `../data/ethereum/assets/${contract.key}`)
    await exec(`mkdir -p ${dir}`)

    await writeFile(path.join(dir, 'meta.json'), JSON.stringify(contract.data, null, 2))

    const files = await readdir(dir)
    if (!files.includes('logo.png')) {
      writeFile(path.join(dir, 'logo.svg'), contract.logo)
    }
  }
}

main()

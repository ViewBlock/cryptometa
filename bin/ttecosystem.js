const fs = require('fs')
const _ = require('lodash')
const axios = require('axios')

const { dlImage, exec, writeFile } = require('./utils')

const main = async () => {
  const { data } = await axios('https://portal.thundersoftware.fun/api/webapp')
  const { apps } = data

  for (const app of apps) {
    const { name: rawName, iconUrl, description, url, addresses, categories } = app
    const name = rawName.replace(/\(.*/, '')
    console.log(name)

    const key = _.kebabCase(name.toLowerCase())
    const hasLogo = !!iconUrl
    const logoExt = hasLogo && iconUrl.match(/\.([0-9a-z]+)$/i)[1]

    await exec(`mkdir -p data/thundercore/ecosystem/${key}`)
    if (hasLogo) {
      await dlImage(iconUrl, `data/thundercore/ecosystem/${key}/logo.${logoExt}`)
    }

    await writeFile(
      `data/thundercore/ecosystem/${key}/meta.json`,
      JSON.stringify(
        {
          name,
          description,
          web: url.replace(/\/$/, ''),
          addresses,
          categories: categories.map(c => c.toLowerCase()),
          gen: {
            ...(hasLogo ? { logo: `logo.${logoExt}` } : {}),
          },
        },
        null,
        2,
      ),
    )
  }
}

main()

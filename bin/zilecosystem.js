const fs = require('fs')
const _ = require('lodash')
const axios = require('axios')

const { dlImage, exec, writeFile } = require('./utils')

const main = async () => {
  const { data } = await axios(
    'https://www.zilliqa.com/_next/data/iapeNMXP9k_E8-UagXQ5u/index.json',
  )

  const apps = data.pageProps.data.projects

  for (const app of apps) {
    const {
      name: rawName,
      description,
      website,
      discord,
      telegram,
      twitter,
      addresses,
      categories,
    } = app
    const name = rawName.replace(/\(.*/, '')
    console.log(name)

    const key = _.kebabCase(name.toLowerCase())
    const hasLogo = !!app.logo
    const logoExt = hasLogo && app.logo.match(/\.([0-9a-z]+)$/i)[1]

    await exec(`mkdir -p data/zilliqa/ecosystem/${key}`)
    if (hasLogo) {
      await dlImage(
        `https://www.zilliqa.com/zil-ecosystem/projects/${app.path}/${app.logo}`,
        `data/zilliqa/ecosystem/${key}/logo.${logoExt}`,
      )
    }

    await writeFile(
      `data/zilliqa/ecosystem/${key}/meta.json`,
      JSON.stringify(
        {
          name,
          description,
          web: website ? website.replace(/\/$/, '') : null,
          links: Object.entries({
            twitter,
            telegram,
            discord,
          }).reduce((acc, [key, val]) => {
            if (val) acc[key] = val
            return acc
          }, {}),
          addresses,
          categories: (categories || '').split(','),
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

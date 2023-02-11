const fs = require('fs')

const { exec, writeFile } = require('../../../bin/utils')

const apps = [
  'amplify',
  'arconnect',
  'ardrive',
  'argo',
  'argora',
  'arverify',
  'arweavenews',
  'arwiki',
  'bundlr',
  'checkmynft',
  'communityxyz',
  'decentland',
  'ecclesia',
  'everfinance',
  'evermore',
  'gitcoin',
  'glass',
  'koii',
  'kyve',
  'mirror',
  'nest-land',
  'permabot',
  'permacast',
  'pianity',
  'pocketnetwork',
  'redstone',
  'sarcophagus',
  'verto',
  'viewblock',
  'weve',
  'wisdomwizards',
  'glacier'
]

const main = async () => {
  for (const app of apps) {
    const meta = require(`./${app}/meta.json`)
    const res = await exec(`ls ./${app} -I meta.json`)

    console.log(app)

    const logos = res.stdout.trim().split('\n')
    const gen = {
      logo: logos[0],
      ...(logos[1] ? { hasDark: true } : {}),
      ...(logos[1] && !logos[1].includes('.png') ? { darkExt: logos[1].split('.')[1] } : {}),
    }

    const description = meta.description || meta.desc
    const web = (meta.web || meta.url || '').replace(/\/$/, '')

    await writeFile(
      `./${app}/meta.json`,
      JSON.stringify(
        {
          name: meta.name,
          description,
          web,
          categories: meta.categories
            ? meta.categories
            : meta.category
            ? [meta.category.toLowerCase()]
            : [],
          addresses: meta.addresses || [],
          links: meta.links
            ? meta.links
            : {
                ...(meta.github
                  ? {
                      github: meta.github.replace('https://github.com/', ''),
                    }
                  : {}),
              },
          developers: meta.developers
            ? meta.developers
                .filter(d => d.name)
                .map(d => ({
                  name: d.name,
                  ...(d.github ? { github: d.github } : {}),
                  ...(d.twitter ? { twitter: d.twitter } : {}),
                }))
            : [],
          gen,
        },
        null,
        2,
      ),
    )
  }
}

main()

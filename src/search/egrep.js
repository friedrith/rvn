const egrep = require('@apexearth/egrep')

const { indexes, dbFolder } = require('./db')

const search = query =>
  new Promise(resolve => {
    if (!query || query.length < 2) {
      resolve([])
      return
    }

    indexes().then(index => {
      const stream = egrep({
        pattern: new RegExp(query, 'i'),
        files: [dbFolder],
        recursive: true,
      })

      const results = []

      stream.on('data', data => {
        const file = index.find(i => i.newFilename === data.file)

        if (file) {
          const {
            id,
            url,
            repo,
            owner,
            readmeUrl,
            downloadUrl,
            newFilename,
            path,
          } = file
          results.push({
            text: data.line.trim(),
            id,
            url,
            repo,
            owner,
            readmeUrl,
            downloadUrl,
            newFilename,
            path,
          })
        }
      })
      stream.on('error', err => {
        console.log(err)
      })
      stream.on('close', () => {
        resolve(results)
      })
    })
  })

module.exports = { search }

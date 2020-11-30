const path = require('path')
const https = require('https')
const rimraf = require('rimraf')

const fsSync = require('fs')
const { promises: fs } = require('fs')

const { v4: uuidv4 } = require('uuid')

const { configFolder } = require('../config')

const dbFolder = path.join(configFolder, 'db')
const indexFilename = path.join(configFolder, 'db.json')

let results = []

const start = async () => {
  try {
    await fs.access(dbFolder)
  } catch (error) {
    await fs.mkdir(dbFolder)
  }
}

const hasIndexes = () => fs.access(indexFilename)

const download = (filename, url) =>
  new Promise((resolve, reject) => {
    const file = fsSync.createWriteStream(filename)
    https
      .get(url, response => {
        response.pipe(file)

        file.on('finish', () => {
          file.close(() => {
            resolve()
          })
        })
      })
      .on('error', error => {
        fs.unlink(filename)
        reject(error)
      })
  })

const add = async file => {
  const id = uuidv4()

  const extension = path.extname(file.path)

  const newFilename = path.join(dbFolder, `${id}${extension}`)

  const { url, repo, owner, readmeUrl, downloadUrl } = file

  await download(newFilename, downloadUrl)

  results.push({
    id,
    url,
    repo,
    owner,
    readmeUrl,
    downloadUrl,
    newFilename,
    path: file.path,
  })
}

const save = () => fs.writeFile(indexFilename, JSON.stringify(results, null, 4))

const indexes = async () => {
  const data = await fs.readFile(indexFilename, 'utf8')
  return JSON.parse(data)
}

const clear = async () => {
  rimraf.sync(dbFolder)
  results = []
}

module.exports = { start, add, save, indexes, dbFolder, clear, hasIndexes }

const path = require('path')
const { promises: fs } = require('fs')
const { homedir } = require('os')
const configFolder =
  process.env.MODE === 'dev'
    ? path.join(__dirname, '../.rvn')
    : path.join(homedir(), '.rvn')

const configFilename = path.join(configFolder, 'config.json')

const start = async () => {
  try {
    await fs.access(configFolder)
  } catch (error) {
    await fs.mkdir(configFolder)
  }
}

const save = config => fs.writeFile(configFilename, JSON.stringify(config))

const load = async () => JSON.parse(await fs.readFile(configFilename, 'utf8'))

const show = () => ({
  mode: process.env.MODE,
  path: configFolder,
})

module.exports = {
  configFolder,
  start,
  save,
  load,
  show,
}

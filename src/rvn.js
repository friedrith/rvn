const yargs = require('yargs/yargs')
const ora = require('ora')
const chalk = require('chalk')
const open = require('open')
const inquirer = require('inquirer')
const terminalLink = require('terminal-link')
require('dotenv').config()

const promptForSearch = require('./prompt')
const db = require('./search/db')
const { getGithubFiles } = require('./github')
const config = require('./config')
const { version } = require('../package')

const { argv } = yargs(process.argv.slice(2))
  .option('index', {
    type: 'boolean',
    description: 'Index all readme files of your repositories',
  })
  .option('token', {
    type: 'string',
    description: 'Change your github token',
  })

const flatten = array => array.reduce((acc, arr) => acc.concat(arr), [])

const index = async conf => {
  await db.clear()
  await db.start()

  const spinner = ora({
    text: 'Repositories indexation in progress...',
    interval: 5,
    spinner: 'dots',
  })

  spinner.start()
  const files = await getGithubFiles(conf)

  spinner.stop()

  const promises = flatten(files).map(db.add)

  await Promise.all(promises)

  await db.save()

  console.log(chalk.green(`${files.length} files indexed`))
}

const startIndex = async () => {
  try {
    const conf = await config.load()

    if (!conf.token) {
      throw new Error()
    }

    await index(conf)
  } catch (error) {
    const link = terminalLink('link', 'https://github.com/settings/tokens/new')
    const { response } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'response',
        message: 'rvn requires a github token. Generate new token?',
        prefix: '',
      },
    ])
    if (response) {
      console.log(`You don't any specific scope.`)
      open('https://github.com/settings/tokens/new')
    }
    const { token } = await inquirer.prompt([
      {
        type: 'text',
        name: 'token',
        message: `rvn requires a github token. Create a new token using this ${link} . Then enter it:`,
        prefix: '',
      },
    ])

    config.save({ token })
    await index({ token })
  }
}

const search = async () => {
  const { url } = await promptForSearch()
  open(url)
}

const rvn = async () => {
  await config.start()

  if (argv.version) {
    console.log(version)
  }

  if (argv.token) {
    config.save({ token: argv.token })
  }

  if (argv.clear) {
    db.clear()
  } else if (argv.index) {
    await startIndex()
  } else {
    try {
      await db.hasIndexes()
      await search()
    } catch (error) {
      const { wantIndex } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'wantIndex',
          message:
            'No repositories indexed. Do you want to start repositories indexation?',
          prefix: '',
        },
      ])

      if (wantIndex) {
        await startIndex()
        await search()
      }
    }
  }
}

rvn()

const inquirer = require('inquirer')
const autoCompletePrompt = require('inquirer-autocomplete-prompt')
const chalk = require('chalk')
const terminalLink = require('terminal-link')

const { search } = require('./search/egrep')

const prettier = (result, results) => {
  const maxLength = Math.max(
    ...results.map(r => r.text.substring(0, 100).length)
  )

  let searchLabel = result.text.substring(0, 100)

  const searchLabelLength = searchLabel.length

  for (let i = searchLabelLength; i < maxLength + 3; i++) {
    searchLabel += '.'
  }

  const search = searchLabel // chalk.blueBright(searchLabel)

  const repo = `${chalk.yellow.bold(`${result.repo}/${result.path}`)}`

  return `${search} in ${terminalLink(repo, result.readmeUrl)}`
}

const prompt = () => {
  inquirer.registerPrompt('autocomplete', autoCompletePrompt)
  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'url',
      message: 'Search in repositories:',
      prefix: '',
      loop: false,
      source: async (answersSoFar, input) => {
        const results = await search(input)

        return results.map(result => ({
          name: prettier(result, results),
          value: result.readmeUrl,
        }))
      },
    },
  ])
}

module.exports = prompt

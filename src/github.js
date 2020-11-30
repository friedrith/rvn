const { Octokit } = require('@octokit/rest')

let octokit = null

const getMarkdownFiles = async ({ repo, owner, url }) => {
  try {
    const { data: readme } = await octokit.repos.getReadme({ repo, owner })
    const { html_url: readmeUrl, download_url: downloadUrl, path } = readme
    return [{ url, repo, owner, readmeUrl, downloadUrl, path }]
  } catch (error) {
    return []
  }
}

const getGithubFiles = async ({ token }) => {
  octokit = new Octokit({
    auth: token,
  })

  const { data: repos } = await octokit.repos.listForAuthenticatedUser()

  return Promise.all(
    repos
      .map(({ name, owner, html_url }) => ({
        repo: name,
        owner: owner.login,
        url: html_url,
      }))
      .map(getMarkdownFiles)
  )
}

module.exports = {
  getGithubFiles,
}

import * as core from '@actions/core'
import * as http from '@actions/http-client'

export async function lookupLatestVersion(): Promise<{
  name: string
  version: string
  url: string
}> {
  const latestUrl = 'https://release.diffblue.com/cli/latest'
  core.info(`Checking ${latestUrl}`)

  const client = new http.HttpClient('diffblue/cover-github-action', [], {
    allowRedirects: false
  })
  const response = await client.get(latestUrl)

  const status = response.message.statusCode || 0
  if (status < 300 || status > 399) {
    throw Error(
      `Expected 3xx response but found ${response.message.statusCode}`
    )
  }

  const redirectUrl = response.message.headers.location
  if (redirectUrl === undefined) {
    throw Error(`Expected redirect location but found none`)
  }

  const regex = /^.*\/(\D+)-(\d.+)\.zip$/
  const groups = regex.exec(redirectUrl)
  if (groups === undefined || groups === null) {
    throw Error(`Expected parseable url but found ${redirectUrl}`)
  }

  return {
    name: groups[1],
    version: groups[2],
    url: redirectUrl
  }
}

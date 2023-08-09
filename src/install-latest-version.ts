import * as core from '@actions/core'
import * as io from '@actions/io'
import * as tool from '@actions/tool-cache'

import {lookupLatestVersion} from './lookup-latest-version'

export async function installLatestVersion(): Promise<void> {
  const {name, version, url} = await lookupLatestVersion()

  let installation = tool.find(name, version)
  if (installation === '') {
    core.info(`Downloading ${url}`)
    const file = await tool.downloadTool(url)
    const dir = await tool.extractZip(file)
    installation = await tool.cacheDir(dir, name, version)

    await io.rmRF(file)
    await io.rmRF(dir)
  }

  core.addPath(installation)
}

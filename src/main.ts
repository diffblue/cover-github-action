import * as core from '@actions/core'
import * as exec from '@actions/exec'

import {installLatestVersion} from './install-latest-version'

async function run(): Promise<void> {
  try {
    core.startGroup('Install Diffblue Cover')
    await installLatestVersion()
    await exec.exec('dcover', ['--version'])

    const key: string = core.getInput('license-key')
    await exec.exec('dcover', ['activate', key])

    core.endGroup()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

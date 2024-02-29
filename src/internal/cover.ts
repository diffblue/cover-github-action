import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {installLatestVersion} from './install-latest-version'
import {Status} from './status-model'
import {saveStatus} from './status-io'

/**
 * Installs `dcover` for use by other commands and functions.
 *
 * @param status the status to be updated and saved.
 */
export async function install(status: Status): Promise<void> {
  core.startGroup('Install')
  await installLatestVersion(status)
  await exec.exec('dcover', ['--version'])
  core.endGroup()
  saveStatus(status)
}

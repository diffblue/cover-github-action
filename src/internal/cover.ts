import * as exec from '@actions/exec'
import {installLatestVersion} from './install-latest-version'

/**
 * Installs `dcover` for use by other commands and functions.
 */
export async function install(): Promise<void> {
  await installLatestVersion()
  await exec.exec('dcover', ['--version'])
}

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {installLatestVersion} from './install-latest-version'
import {uploadLogs} from './upload-logs'
import {readStatus, saveStatus} from './status-io'

async function run(): Promise<void> {
  const status = await readStatus()
  try {
    core.startGroup('Install Diffblue Cover')
    await installLatestVersion(status)
    await exec.exec('dcover', ['--version'])

    const keyName = 'license-key'
    const keyValue: string = core.getInput(keyName)
    if (keyValue === '') {
      throw new Error(
        [
          `Missing '${keyName}' configuration:`,
          `Please ensure that the action has a '${keyName}' configured, typically using a GitHub secret.`,
          `Please ensure that all users pushing to the repository has access to the necessary secret.`
        ].join('\n')
      )
    }
    await exec.exec('dcover', ['activate', keyValue])

    core.endGroup()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }

  await uploadLogs()
  await saveStatus(status)
}

run()

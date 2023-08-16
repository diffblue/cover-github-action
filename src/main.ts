import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as git from './git'
import {skip} from './skip'
import {installLatestVersion} from './install-latest-version'
import {upload} from './upload'
import {summary} from './summary'
import {readStatus} from './status-io'

async function run(): Promise<void> {
  if (await skip()) {
    return
  }

  const status = await readStatus()
  try {
    await git.prepare(status)

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
    status.error = error
    if (error instanceof Error) {
      core.setFailed(error.message)
      if (error.stack) {
        core.error(error.stack)
      }
    }
  }

  await upload(status)
  await summary(status)
}

run()

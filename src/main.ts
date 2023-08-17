import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as git from './git'
import * as cover from './cover'
import {skip} from './skip'
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
    await cover.install(status)

    core.startGroup('Activate')
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
        core.info(error.stack)
      }
    }
  }

  await upload(status)
  await summary(status)
}

run()

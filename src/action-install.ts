import * as core from '@actions/core'
import * as cover from './internal/cover'
import {skip} from './internal/skip'
import {upload} from './internal/upload'
import {readStatus, saveStatus} from './internal/status-io'

/**
 * Runs the "install" isolated action.
 */
async function run(): Promise<void> {
  if (await skip()) {
    return
  }

  const status = await readStatus()
  try {
    await cover.install(status)
  } catch (error) {
    status.error = error
    if (error instanceof Error) {
      core.setFailed(error.message)
      if (error.stack) {
        core.info(error.stack)
      }
    }
  }

  await saveStatus(status)
  await cover.cleanup()
  await upload(status)
}

run()

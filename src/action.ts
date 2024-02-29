import * as core from '@actions/core'
import * as git from './internal/git'
import * as cover from './internal/cover'
import {skip} from './internal/skip'
import {readStatus} from './internal/status-io'

/**
 * Runs the "batteries included" combined action.
 */
async function run(): Promise<void> {
  if (await skip()) {
    return
  }

  const status = await readStatus()
  try {
    await cover.install(status)
    await cover.activate()
    await cover.clean(status)
    await cover.validate(status)
    await cover.createPreFlight(status)
    await cover.create(status)
    await git.push(status)
  } catch (error) {
    status.error = error
    if (error instanceof Error) {
      core.setFailed(error.message)
      if (error.stack) {
        core.info(error.stack)
      }
    }
  }

  await cover.cleanup()
}

run()

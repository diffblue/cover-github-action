import * as core from '@actions/core'
import * as cover from './internal/cover'
import {skip} from './internal/skip'

/**
 * Runs the "install" isolated action.
 */
async function run(): Promise<void> {
  if (await skip()) {
    return
  }

  try {
    await cover.install()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
      if (error.stack) {
        core.info(error.stack)
      }
    }
  }
}

run()

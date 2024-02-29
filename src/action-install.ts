import * as core from '@actions/core'
import * as cover from './internal/cover'

/**
 * Runs the "install" isolated action.
 */
async function run(): Promise<void> {
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

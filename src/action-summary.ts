import {summary} from './internal/summary'
import {skip} from './internal/skip'
import {readStatus, saveStatus} from './internal/status-io'

/**
 * Runs the "summary" isolated action.
 */
async function run(): Promise<void> {
  if (await skip()) {
    return
  }

  const status = await readStatus()
  await summary(status)
}

run()

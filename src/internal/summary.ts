import * as core from '@actions/core'
import {saveStatus} from './status-io'
import {Status} from './status-model'
import {markdownSummary} from './status-md'

/**
 * @param status the status to be summarised and saved.
 */
export async function summary(status: Status): Promise<void> {
  status.work_in_progress = false
  await saveStatus(status)

  await core.summary.addRaw(markdownSummary(status)).write()
}

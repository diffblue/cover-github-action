import * as core from '@actions/core'
import * as artifacts from '@actions/artifact'
import * as glob from '@actions/glob'
import {Status} from './status-model'

/**
 * Upload Diffblue Cover logs and other run artifacts.
 * Artifacts are named using the topic slug so that multiple
 * occurrences lead to uniquely named artifacts.
 * All files within any `.diffblue` directory are included.
 *
 * @param status the status to find the topic slug from.
 */
export async function upload(status: Status): Promise<void> {
  core.startGroup(`Upload ${status.topic_slug}.zip artifact`)
  const globber = await glob.create('**/.diffblue/**')
  const paths = await globber.glob()
  for (const path of paths) {
    core.info(`Including ${path}`)
  }
  if (paths.length > 0) {
    await artifacts
      .create()
      .uploadArtifact(
        status.topic_slug,
        paths,
        '.',
        {} as artifacts.UploadOptions
      )
  }
  core.endGroup()
}

import * as core from '@actions/core'
import * as artifacts from '@actions/artifact'
import * as glob from '@actions/glob'
import {Status} from './status-model'

/**
 * Upload Diffblue Cover logs and other run artifacts.
 * Artifacts are named using the topic slug so that multiple
 * occurrences lead to uniquely named artifacts.
 *
 * @param status the status to find the topic slug from.
 */
export async function upload(status: Status): Promise<void> {
  core.startGroup(`Upload ${status.topic_slug}.zip artifact`)
  const rootDir = '.diffblue'

  const globber = await glob.create(rootDir)
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
        rootDir,
        {} as artifacts.UploadOptions
      )
  }
  core.endGroup()
}

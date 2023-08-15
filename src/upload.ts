import * as core from '@actions/core'
import * as artifacts from '@actions/artifact'
import * as glob from '@actions/glob'

/**
 * Upload Diffblue Cover logs and other run artifacts.
 */
export async function upload(): Promise<void> {
  core.startGroup('Upload diffblue.zip artifact')
  const rootDir = '.diffblue'

  const globber = await glob.create(rootDir)
  const paths = await globber.glob()
  for (const path of paths) {
    core.info(`Including ${path}`)
  }

  if (paths.length > 0) {
    await artifacts
      .create()
      .uploadArtifact('diffblue', paths, rootDir, {} as artifacts.UploadOptions)
  }
  core.endGroup()
}

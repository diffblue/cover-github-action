import * as core from '@actions/core'
import * as artifacts from '@actions/artifact'
import * as glob from '@actions/glob'
import {stat} from 'fs'
import {promisify} from 'util'

const stats = promisify(stat)

export async function uploadLogs(): Promise<void> {
  core.startGroup('Upload diffblue.zip artifact')
  const rootDir = '.diffblue'
  const files: string[] = []

  const globber = await glob.create(rootDir)
  const rawSearchResults: string[] = await globber.glob()
  for (const path of rawSearchResults) {
    const pathStats = await stats(path)
    if (!pathStats.isDirectory()) {
      core.info(`Including ${path} in upload`)
      files.push(path)
    }
  }

  await artifacts
    .create()
    .uploadArtifact('diffblue', files, rootDir, {} as artifacts.UploadOptions)
  core.endGroup()
}

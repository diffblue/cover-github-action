import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {Status} from './status-model'

/**
 * Runs `git commit` to commit modified files.
 * Unless `commit-and-push` is configured to `false`.
 *
 * @param status the status to be updated and saved.
 */
export async function commit(status: Status, message: string): Promise<void> {
  if (!enabled()) {
    return
  }
  const result = await exec.getExecOutput('git', [
    'status',
    '--untracked-files=all',
    '--porcelain'
  ])
  const charIndexOfFile = 3
  const filesToAdd = result.stdout
    .split(/\r?\n/)
    .map(file => file.substring(charIndexOfFile))
    .filter(file => !file.startsWith('.diffblue/'))
    .filter(file => !file.includes('/.diffblue/'))
    .filter(file => file !== '')
  if (filesToAdd && filesToAdd.length > 0) {
    await exec.exec('git', ['add', ...filesToAdd])
    await exec.exec('git', ['commit', '--message', message])
  }
}

/**
 * Runs `git push` to push changes up.
 * Unless `commit-and-push` is configured to `false`.
 *
 * @param status the status to be updated and saved.
 */
export async function push(status: Status): Promise<void> {
  if (!enabled()) {
    return
  }
  await exec.exec('git', ['push', 'origin', `HEAD:${status.ref}`])
}

/**
 * @returns true iff the `commit-and-push` configuration allows committing and pushing.
 */
function enabled(): boolean {
  return (
    core.getInput('commit-and-push') === '' ||
    core.getInput('commit-and-push') === 'true'
  )
}

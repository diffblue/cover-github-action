import * as exec from '@actions/exec'
import {Status} from './status-model'

/**
 * Runs `git commit` to commit modified files.
 *
 * @param status the status to be updated and saved.
 */
export async function commit(status: Status, message: string): Promise<void> {
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
 *
 * @param status the status to be updated and saved.
 */
export async function push(status: Status): Promise<void> {
  await exec.exec('git', ['push', 'origin', `HEAD:${status.ref}`])
}

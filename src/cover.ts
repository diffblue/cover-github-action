import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as git from './git'
import {installLatestVersion} from './install-latest-version'
import {Status} from './status-model'
import {saveStatus} from './status-io'

/**
 * Installs `dcover` for use by other commands and functions.
 *
 * @param status the status to be updated and saved.
 */
export async function install(status: Status): Promise<void> {
  core.startGroup('Install')
  await installLatestVersion(status)
  await exec.exec('dcover', ['--version'])
  core.endGroup()
  saveStatus(status)
}

/**
 * Runs `dcover activate` using the `license-key` inputs.
 */
export async function activate(): Promise<void> {
  core.startGroup('Activate')
  const keyName = 'license-key'
  const keyValue: string = core.getInput(keyName)
  if (keyValue === '') {
    throw new Error(
      [
        `Missing '${keyName}' configuration:`,
        `Please ensure that the action has a '${keyName}' configured, typically using a GitHub secret.`,
        `Please ensure that all users pushing to the repository has access to the necessary secret.`
      ].join('\n')
    )
  }
  await exec.exec('dcover', ['activate', keyValue])
  core.endGroup()
}

/**
 * Runs `dcover create`.
 *
 * @param status the status to be updated and saved.
 */
export async function create(status: Status): Promise<void> {
  core.startGroup('Create')
  await exec.exec('dcover', [
    'create',
    '--batch',
    ...workingDirectoryArgs(),
    ...extraArgs('create-args')
  ])
  await git.commit(status, 'Added tests created with Diffblue Cover')
  core.endGroup()
}

/**
 * @returns the `--working-directory` arguments based on `working-directory` input, or an empty array.
 */
function workingDirectoryArgs(): string[] {
  const workingDirectory = core.getInput('working-directory')
  if (workingDirectory) {
    return ['--working-directory', workingDirectory]
  } else {
    return []
  }
}

/**
 * @param input the name of the extra-args input to split.
 * @returns the extra arguments split on spaces, or an empty array.
 */
function extraArgs(input: string): string[] {
  return core
    .getInput(input)
    .split(/\s+/)
    .filter(arg => arg !== '')
}

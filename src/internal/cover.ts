import * as glob from '@actions/glob'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as path from 'path'
import * as git from './git'
import * as gradle from './gradle'
import {installLatestVersion} from './install-latest-version'
import {Report, Status} from './status-model'
import {saveStatus} from './status-io'
import {readFileSync} from 'fs'

declare let process: {
  env: {
    GITHUB_WORKSPACE: string
  }
}

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
 * Runs `dcover clean`.
 *
 * @param status the status to be updated and saved.
 */
export async function clean(status: Status): Promise<void> {
  core.startGroup('Clean')
  await exec.exec('dcover', [
    'clean',
    '--batch',
    ...workingDirectoryArgs(),
    ...extraArgs('clean-args')
  ])
  await git.commit(status, 'Removed non-compiling Diffblue tests')
  core.endGroup()
}

/**
 * Runs `dcover validate`.
 *
 * @param status the status to be updated and saved.
 */
export async function validate(status: Status): Promise<void> {
  core.startGroup('Validate')
  await exec.exec('dcover', [
    'validate',
    '--batch',
    ...workingDirectoryArgs(),
    ...extraArgs('validate-args')
  ])
  await git.commit(status, 'Removed failing Diffblue tests')
  core.endGroup()
}

/**
 * Runs `dcover create --pre-flight`.
 * Additionally uses `--fix-build` and commits any resulting fixes.
 *
 * @param status the status to be updated and saved.
 */
export async function createPreFlight(status: Status): Promise<void> {
  core.startGroup('Create (pre-flight)')
  await exec.exec('dcover', [
    'create',
    '--batch',
    '--pre-flight',
    '--fix-build',
    ...workingDirectoryArgs(),
    ...extraArgs('create-args')
  ])
  await git.commit(status, 'Fixed build for use with Diffblue Cover')
  core.endGroup()
}

/**
 * Runs `dcover create`.
 *
 * @param status the status to be updated and saved.
 */
export async function create(status: Status): Promise<void> {
  core.startGroup('Create')

  const patchFile = core.getInput('patch')
  if (patchFile === '' || isBaseline()) {
    await exec.exec('dcover', [
      'create',
      '--batch',
      ...workingDirectoryArgs(),
      ...extraArgs('create-args')
    ])
    await git.commit(status, 'Baseline tests from Diffblue Cover')
  } else {
    await exec.exec('dcover', [
      'create',
      '--batch',
      '--patch-only',
      path.resolve(patchFile),
      ...workingDirectoryArgs(),
      ...extraArgs('create-args')
    ])
    await git.commit(status, 'Updated tests from Diffblue Cover')
  }

  const globber = await glob.create('**/.diffblue/reports/report.json')
  const reportFiles: string[] = await globber.glob()
  for (const reportFile of reportFiles) {
    const report = JSON.parse(readFileSync(reportFile, 'utf8')) as Report
    let reportName = reportFile
    if (reportName.startsWith(process.env.GITHUB_WORKSPACE)) {
      reportName = reportName.substring(process.env.GITHUB_WORKSPACE.length)
    }
    reportName = reportName.substring(
      0,
      reportName.length - '/.diffblue/reports/report.json'.length
    )
    reportName = reportName.replace(/\\/g, '/')
    reportName = reportName.replace(/^\/+/g, '')
    if (reportName === '' || reportName === '/') {
      reportName = '(root module)'
    }
    status.reports.set(reportName, report)
  }
  saveStatus(status)
  core.endGroup()
}

/**
 * Cleanup after `dcover` use.
 */
export async function cleanup(): Promise<void> {
  core.startGroup('Cleanup')
  await gradle.stop()
  core.endGroup()
}

/**
 * @returns `true` if no baseline marker exists.
 */
export function isBaseline(): boolean {
  let baselineFile: string
  const workingDirectory = core.getInput('working-directory')
  if (workingDirectory) {
    baselineFile = `${workingDirectory}/.diffblue-baseline-marker`
  } else {
    baselineFile = `.diffblue-baseline-marker`
  }

  const baseline = !fs.existsSync(baselineFile)

  if (baseline) {
    fs.writeFileSync(
      baselineFile,
      'This file indicates that baseline tests have been created for this module\n'
    )
    exec.exec('git', ['add', baselineFile])
  }

  return baseline
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

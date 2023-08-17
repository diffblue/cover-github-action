import * as glob from '@actions/glob'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as git from './git'
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
 * Runs `dcover create --pre-flight`.
 */
export async function createPreFlight(): Promise<void> {
  core.startGroup('Create (pre-flight)')
  await exec.exec('dcover', [
    'create',
    '--batch',
    '--pre-flight',
    ...workingDirectoryArgs(),
    ...extraArgs('create-args')
  ])
  core.endGroup()
}

/**
 * Runs `dcover fix-build`, if a `.diffblue/refactorings.yml` is found.
 *
 * @param status the status to be updated and saved.
 */
export async function fixBuildIfNeeded(status: Status): Promise<void> {
  const globber = await glob.create('**/.diffblue/refactorings.yml')
  const refactorings: string[] = await globber.glob()
  if (refactorings) {
    await fixBuild(status)
  }
}

/**
 * Runs `dcover fix-build`.
 *
 * @param status the status to be updated and saved.
 */
export async function fixBuild(status: Status): Promise<void> {
  core.startGroup('Fix build')
  await exec.exec('dcover', [
    'fix-build',
    '--batch',
    ...workingDirectoryArgs(),
    ...extraArgs('refactor-args')
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
  await exec.exec('dcover', [
    'create',
    '--batch',
    ...workingDirectoryArgs(),
    ...extraArgs('create-args')
  ])
  await git.commit(status, 'Added tests created with Diffblue Cover')

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

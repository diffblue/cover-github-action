import * as glob from '@actions/glob'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as path from 'path'
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
    ...coverReportsArgs(status),
    ...extraArgs('create-args')
  ])
  core.endGroup()
}

/**
 * Runs `dcover create`.
 *
 * @param status the status to be updated and saved.
 */
export async function create(status: Status): Promise<void> {
  core.startGroup('Create')
  const createArgs = ['create', '--batch']

  const patchFile = core.getInput('patch')
  if (patchFile === '' || (await isBaseline())) {
    await exec.exec('dcover', [
      ...createArgs,
      ...workingDirectoryArgs(),
      ...coverReportsArgs(status),
      ...extraArgs('create-args')
    ])
  } else {
    await exec.exec('dcover', [
      ...createArgs,
      ...workingDirectoryArgs(),
      ...patchOnlyArgs(patchFile),
      ...extraArgs('create-args')
    ])
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
    status.reports[reportName] = report
  }
  saveStatus(status)
  core.endGroup()
}

/**
 * @returns `true` if no baseline marker exists.
 */
export async function isBaseline(): Promise<boolean> {
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
 * @param status the status to derive project argument.
 * @returns the `--coverage-reports` arguments based on `cover-reports-url` input, or an empty array.
 */
function coverReportsArgs(status: Status): string[] {
  const url = core.getInput(`cover-reports-url`)
  if (url === '') {
    return []
  }

  // Smoke & Mirrors:
  // Obviously this should make use of the url above, but
  // the demo uses an SSH tunnel and the correct URL is never
  // derived, so we end up hacking it together here instead:
  status.cover_reports_url = `https://demo.reports.diffblue.co.uk/ui/project/${status.owner}/${status.repo}`

  return [
    `--coverage-reports`,
    `--report`,
    url,
    `--project`,
    `${status.owner}.${status.repo}`
  ]
}

/**
 * @param patchFile the path to the patch file.
 * @returns the `--patch-only` arguments, or an empty array if the given patch file is empty.
 */
function patchOnlyArgs(patchFile: string): string[] {
  if (patchFile === '') {
    return []
  }
  return ['--patch-only', path.resolve(patchFile)]
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

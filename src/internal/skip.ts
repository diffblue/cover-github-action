import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import {Octokit} from '@octokit/action'

declare let process: {
  env: {
    GITHUB_REPOSITORY: string
  }
}

/**
 * @returns `true` iff the action should be skipped for any reason
 */
export async function skip(): Promise<boolean> {
  core.startGroup('Checking whether to skip')
  let result = false
  try {
    result =
      (await skipEventType()) ||
      (await skipDependabot()) ||
      (await skipOwnCommits())
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(e)
    } else {
      core.setFailed(`${e}`)
    }
    result = true
  }
  core.endGroup()
  return result
}

/**
 * @returns `true` iff the action should be skipped due to the event type.
 */
export async function skipEventType(): Promise<boolean> {
  const eventName = github.context.eventName
  const result = eventName !== 'pull_request'
  if (result) {
    core.info(`Skipping event type: ${eventName}`)
  }
  return result
}

/**
 * @returns `true` iff the event was sourced from dependabot
 */
export async function skipDependabot(): Promise<boolean> {
  const actor = github.context.actor
  const result = actor === 'dependabot[bot]'
  if (result) {
    core.info(`Skipping event actor: ${actor}`)
  }
  return result
}

/**
 * @returns `true` iff the head commit was authored by the configured user and email
 */
export async function skipOwnCommits(): Promise<boolean> {
  const config = await configuredAuthor()
  const author = await headCommitAuthor()
  const result =
    config !== undefined && author !== undefined && config === author
  if (result) {
    core.info(`Skipping commits authored by: ${author}`)
  }
  return result
}

/**
 * @returns the name and email address of the configured commit author, if configured.
 */
async function configuredAuthor(): Promise<string> {
  const configName = (
    await exec.getExecOutput('git', ['config', '--get', 'user.name'])
  ).stdout.trim()
  const configEmail = (
    await exec.getExecOutput('git', ['config', '--get', 'user.email'])
  ).stdout.trim()
  if (configName === '' || configEmail === '') {
    new Error('Please configure git user.name and user.email')
  }
  return `${configName} <${configEmail}>`
}

/**
 * @returns the name and email address of the HEAD commit author, if known.
 */
async function headCommitAuthor(): Promise<string | undefined> {
  try {
    const sha = github.context.payload.pull_request?.head?.sha || ''
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
    const octokit = new Octokit()
    const commit = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: sha
    })
    const authorName = commit.data.commit.author?.name
    const authorEmail = commit.data.commit.author?.email
    return `${authorName} <${authorEmail}>`
  } catch (error) {
    return undefined
  }
}

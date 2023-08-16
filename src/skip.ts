import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * @returns `true` iff the action should be skipped for any reason
 */
export async function skip(): Promise<boolean> {
  return (await skipEventType()) || (await skipDependabot())
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

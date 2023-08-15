import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * @returns `true` iff the action should be skipped due to the event type.
 */
export function skipEventType(): boolean {
  const eventName = github.context.eventName
  const skip = eventName !== 'pull_request'
  if (skip) {
    core.info(`Skipping event type: ${eventName}`)
  }
  return skip
}

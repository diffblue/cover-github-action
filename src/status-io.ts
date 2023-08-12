import * as core from '@actions/core'
import {Octokit} from '@octokit/action'
import {readFileSync, writeFileSync} from 'fs'
import {Status} from './status-model'

/** The file where the status markdown should be written. */
const markdownFile = '.diffblue/status.md'

/** The file where the status JSON should be written. */
const jsonFile = '.diffblue/status.json'

/**
 * @returns the previously stored status, or else a fresly created one.
 */
export async function readStatus(): Promise<Status> {
  try {
    return JSON.parse(readFileSync(jsonFile, 'utf8')) as Status
  } catch (error) {
    return new Status()
  }
}

/**
 * Saves the given status to the working directory, and as a pull request comment.
 * @param status the status to be saved.
 */
export async function saveStatus(status: Status): Promise<void> {
  writeFileSync(markdownFile, status.markdown(), {flag: 'w'})
  writeFileSync(jsonFile, JSON.stringify(status, undefined, '  '), {flag: 'w'})

  const octokit = new Octokit()
  await createOrUpdateComment(octokit, status)
  await hidePreviousComments(octokit, status)
}

/**
 * Create or update a comment based on the given status.
 * @param octokit The GitHub API client.
 * @param status The status message identifying the anchor comment.
 */
async function createOrUpdateComment(
  octokit: Octokit,
  status: Status
): Promise<void> {
  if (status.comment_id) {
    const resp = await octokit.rest.issues.updateComment({
      owner: status.owner,
      repo: status.repo,
      comment_id: status.comment_id,
      body: status.markdown()
    })
    core.debug(`Updated Comment: ${resp.data.html_url}`)
  } else {
    const response = await octokit.rest.issues.createComment({
      owner: status.owner,
      repo: status.repo,
      issue_number: status.issue_number,
      body: status.markdown()
    })
    status.comment_id = response.data.id
    writeFileSync(jsonFile, JSON.stringify(status, undefined, '  '), {
      flag: 'w'
    })
    core.debug(`Created Comment: ${response.data.html_url}`)
  }
}

/**
 * Find previous comments referencing the given status topic and hide them.
 * @param octokit The GitHub API client.
 * @param status The status message identifying the anchor comment.
 */
async function hidePreviousComments(
  octokit: Octokit,
  status: Status
): Promise<void> {
  const comments = await findRecentComments(octokit, status)
  const commentsToHide = comments
    .filter(comment => comment.databaseId !== status.comment_id)
    .filter(comment => !comment.isMinimised)
    .filter(
      comment => status.topic_slug && comment.body.includes(status.topic_slug)
    )
  for (const comment of commentsToHide) {
    await hideOutdatedComment(octokit, comment)
  }
}

/**
 * GitHub pull request model, for use with GitHub GraphQL API.
 */
class Comment {
  /** The GitHub GraphQL ID of the comment */
  id = ''

  /** The GitHub REST/DB ID of the comment */
  databaseId = 0

  /** The user clickable url of the comment */
  url = ''

  /** The markdown body of the comment */
  body = ''

  /** Is the comment minimised */
  isMinimised = false
}

/**
 * Finds recent comments on the same pull request.
 * @param octokit The GitHub API client.
 * @param status The status message identifying the anchor comment.
 */
async function findRecentComments(
  octokit: Octokit,
  status: Status
): Promise<Comment[]> {
  class FindRecentCommentsComment {
    nodes = [] as Comment[]
  }
  class FindRecentCommentsPullRequest {
    comments = {} as FindRecentCommentsComment
  }
  class FindRecentCommentsRepository {
    pullRequest = {} as FindRecentCommentsPullRequest
  }
  class FindRecentCommentsResponse {
    repository = {} as FindRecentCommentsRepository
  }
  const response: FindRecentCommentsResponse = await octokit.graphql({
    query: `
      query findRecentComments($owner: String!, $repo: String!, $issue_number: Int!) {
        repository(owner:$owner, name:$repo) {
          pullRequest(number: $issue_number) {
            comments(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
              nodes {
                id
                databaseId
                url
                body
                isMinimized
              }
            }
          }
        }
      }
    `,
    owner: status.owner,
    repo: status.repo,
    issue_number: status.issue_number
  })
  return response.repository.pullRequest.comments.nodes
}

/**
 * Hides the given pull request comment.
 * @param octokit The GitHub API client.
 * @param comment The comment to hide.
 */
async function hideOutdatedComment(
  octokit: Octokit,
  comment: Comment
): Promise<void> {
  await octokit.graphql({
    query: `
      mutation hideOutdatedComment($id: ID!) {
        minimizeComment(input: {subjectId: $id, classifier: OUTDATED}) {
          clientMutationId
        }
      }
    `,
    id: comment.id
  })
  core.debug(`Hidden Comment: ${comment.url}`)
}

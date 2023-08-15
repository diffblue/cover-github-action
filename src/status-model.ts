import * as core from '@actions/core'
import * as github from '@actions/github'

declare let process: {
  env: {
    GITHUB_REPOSITORY: string
    GITHUB_JOB: string
    GITHUB_WORKFLOW: string
    GITHUB_SERVER_URL: string
    GITHUB_RUN_ID: string
    GITHUB_RUN_ATTEMPT: string
  }
}

export class Status {
  /** The GitHub repository owner */
  owner: string

  /** The GitHub repository name */
  repo: string

  /** The GitHub workflow name */
  workflow: string

  /** The GitHub workflow job name */
  job: string

  /** A string identifying the comment topic, used to identify and hide previous comments on the same topic */
  topic_slug: string

  /** The title used when linking to the run */
  run_link_title: string

  /** The url used when linking to the run */
  run_link_url: string

  /** The sha of the latest commit to the pull request */
  sha: string

  /** The pull request issue number */
  issue_number: number

  /** The GitHub REST/DB id of the pull request comment */
  comment_id?: number

  /** The Diffblue Cover version, or error associated with it's discovery, if known */
  version?: string | Error

  constructor() {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
    this.owner = owner
    this.repo = repo
    this.workflow = process.env.GITHUB_WORKFLOW
    this.job = process.env.GITHUB_JOB

    let differentiator = core.getInput('topic-id-differentiator')
    if (differentiator) {
      differentiator = ` (${differentiator})`
    }

    this.topic_slug =
      `Diffblue Cover Action ${this.workflow} ${this.job} ${differentiator}`
        .toLowerCase()
        .replace(/\W+/g, ' ')
        .trim()
        .replace(/\s+/g, '-')

    this.run_link_title = `${this.workflow} / ${this.job} ${differentiator}`
    this.run_link_url = `${process.env.GITHUB_SERVER_URL}/${owner}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}/attempts/${process.env.GITHUB_RUN_ATTEMPT}`

    this.sha = github.context.payload.pull_request?.head?.sha || ''
    this.issue_number = github.context.payload.pull_request?.number || 0
  }

  /**
   * @returns this status rendered to markdown for use in a pull request comment
   */
  markdown(): string {
    return [
      ...this.#markdownHeaderLines(),
      ...this.#markdownVersionLines()
    ].join('\n')
  }

  /**
   * @returns lines of markdown content representing the heading of the comment
   */
  #markdownHeaderLines(): string[] {
    return [
      `<!-- Topic: ${this.topic_slug} -->`,
      `### Diffblue Cover`,
      ``,
      `- Run: [${this.run_link_title} :runner:](${this.run_link_url})`,
      `- Commit: ${this.sha}`
    ]
  }

  /**
   * @returns lines of markdown content showing version information
   */
  #markdownVersionLines(): string[] {
    if (this.version === undefined) {
      return []
    } else if (this.version instanceof Error) {
      return [`- Version: ${this.version.message} :exclamation:`]
    } else {
      return [`- Version: ${this.version} :heavy_check_mark:`]
    }
  }
}

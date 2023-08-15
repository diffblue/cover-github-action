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
  /** `true` iff the status is being actively worked on */
  work_in_progress = true

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

  /** The Diffblue Cover version, if known */
  version?: string

  /** Any error associated with the overall status. */
  error?: unknown

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
      ...this.#markdownVersionLines(),
      ...this.#markdownErrorLines(),
      ...this.#markdownWorkInProgressLines()
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
      `- Run: [${this.run_link_title}](${this.run_link_url})`,
      `- Commit: ${this.sha}`
    ]
  }

  /**
   * @returns lines of markdown content showing version information
   */
  #markdownVersionLines(): string[] {
    if (this.version) {
      return [`- Version: ${this.version}`]
    } else {
      return []
    }
  }

  /**
   * @returns lines of markdown content showing error information
   */
  #markdownErrorLines(): string[] {
    if (this.error instanceof Error) {
      return [`- Error: \`${this.error.message}\` :exclamation:`]
    } else if (this.error) {
      return [`- Error: \`${this.error}\` :exclamation:`]
    } else {
      return []
    }
  }

  /**
   * @returns lines of markdown content showing work in progress information
   */
  #markdownWorkInProgressLines(): string[] {
    if (this.work_in_progress) {
      return [
        ``,
        `:construction: _This comment is under construction and will be updated on completion._ :construction: `
      ]
    } else {
      return []
    }
  }
}

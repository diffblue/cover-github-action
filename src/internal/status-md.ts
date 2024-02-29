import {Status} from './status-model'

/**
 * @param status the status to render as markdown
 * @returns this status rendered to markdown for use in a pull request comment
 */
export function markdownComment(status: Status): string {
  return [
    ...markdownHeaderLines(status),
    ...markdownRunLines(status),
    ...markdownCommitLines(status),
    ...markdownVersionLines(status),
    ...markdownCoverReportsLines(status),
    ...markdownErrorLines(status),
    ...markdownReportsLines(status),
    ...markdownWorkInProgressLines(status),
    ``
  ].join('\n')
}

/**
 * @param status the status to render as markdown
 * @returns lines of markdown heading content
 */
function markdownHeaderLines(status: Status): string[] {
  return [`<!-- Topic: ${status.topic_slug} -->`, `### Diffblue Cover`, ``]
}

/**
 * @param status the status to render as markdown
 * @returns lines of markdown content showing run information
 */
function markdownRunLines(status: Status): string[] {
  return [`- Run: [${status.run_link_title}](${status.run_link_url})`]
}

/**
 * @param status the status to render as markdown
 * @returns lines of markdown content showing commit information
 */
function markdownCommitLines(status: Status): string[] {
  return [`- Commit: ${status.sha}`]
}

/**
 * @param status the status to render as markdown
 * @returns lines of markdown content showing version information
 */
function markdownVersionLines(status: Status): string[] {
  if (status.version) {
    return [`- Version: ${status.version}`]
  } else {
    return []
  }
}

/**
 * @param status the status to render as markdown
 * @returns lines of markdown content showing cover reports information
 */
function markdownCoverReportsLines(status: Status): string[] {
  if (status.cover_reports_url) {
    return [
      `- Cover Report: [${status.owner} / ${status.repo}](${status.cover_reports_url})`
    ]
  } else {
    return []
  }
}

/**
 * @param status the status to render as markdown
 * @returns lines of markdown content showing error information
 */
function markdownErrorLines(status: Status): string[] {
  if (status.error instanceof Error) {
    return [`- Error: \`${status.error.message}\` :exclamation:`]
  } else if (status.error) {
    return [`- Error: \`${status.error}\` :exclamation:`]
  } else {
    return []
  }
}

/**
 * @param status the status to render as markdown
 * @returns lines of markdown content showing reports information
 */
function markdownReportsLines(status: Status): string[] {
  const names = Object.keys(status.reports)
  if (names.length === 0) {
    return []
  } else {
    const table = [
      ``,
      `| Report | Classes | Methods | Tests |`,
      `|:-------|--------:|--------:|------:|`
    ]
    for (const name of names) {
      const report = status.reports[name]
      table.push(
        `| ${name} | ${report.summary.classesCount} | ${report.summary.methodsCount} | ${report.summary.completeTestCount} |`
      )
    }
    table.push(``)
    return table
  }
}

/**
 * @param status the status to render as markdown
 * @returns lines of markdown content showing work in progress information
 */
function markdownWorkInProgressLines(status: Status): string[] {
  if (status.work_in_progress) {
    return [
      ``,
      `:construction: _This comment is under construction and will be updated on completion._ :construction: `
    ]
  } else {
    return []
  }
}

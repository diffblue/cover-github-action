<h1 align="center">Diffblue Cover Pipeline</h1>

<div align="center">

[![MIT License](https://img.shields.io/github/license/diffblue/cover-github-action)](https://github.com/diffblue/cover-github-action/blob/main/LICENSE)
[![CI](https://img.shields.io/github/check-runs/diffblue/cover-github-action/main)](https://github.com/diffblue/cover-github-action/actions?query=branch%3Amain)
[![Latest Release](https://img.shields.io/github/v/release/diffblue/cover-github-action)](https://github.com/diffblue/cover-github-action/releases)

</div>

## Overview

Diffblue Cover Pipeline integrates the power of Diffblue Cover directly into your GitHub Actions workflow to autonomously write and update Java unit tests for your projects on pull requests.
Diffblue Cover Pipeline enables Java teams using GitHub for their CI pipelines to leverage the power of fully autonomous AI to automate unit test suite generation, maintenance and regression detection for their entire codebase.

The Diffblue Cover Pipeline for GitHub integration is provided in the GitHub Actions marketplace.

## Capabilities

Diffblue Cover creates comprehensive, human-like Java unit tests - saving developer time, increasing test coverage, and reducing regression risks.
It takes care of the following, automatically:

- Analyzes a codebase and creates a baseline unit test suite
- Writes new unit tests for new code
- Updates existing unit tests in your code
- Removes existing unit tests in your code when they’re no longer required

## Links

- [Documentation](https://docs.diffblue.com/features/cover-pipeline/cover-pipeline-for-github)
- [Diffblue EULA](https://docs.diffblue.com/legal/diffblue-legal/diffblue-end-user-license-agreement-eula)
- [Diffblue Privacy Notice](https://docs.diffblue.com/legal/diffblue-legal/privacy-notice)
- [Request Diffblue trial license](https://www.diffblue.com/try-cover/github)

## Variants

Multiple variants of the docker action are available using different JDK versions.
The base version currently uses JDK17 but this may change.
In general it's recommended to specify the action with your chosen JDK:

- `diffblue/cover-github-action@main`
- `diffblue/cover-github-action/jdk8@main`
- `diffblue/cover-github-action/jdk11@main`
- `diffblue/cover-github-action/jdk17@main`
- `diffblue/cover-github-action/jdk21@main`

Variants are maintained using the `build.sh` script to ensure that they only vary by JDK from the base version.

## Usage

In its simplest form the "batteries included" action is intended to be used in a workflow to run all things Diffblue Cover:

```yaml
name: Example Workflow

# Diffblue Cover Pipeline responds to pull request events
on:
  pull_request:

# Avoid running the same workflow on the same branch concurrently
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}

jobs:
  DiffblueCover:
    runs-on: ubuntu-latest
    steps:

      # Checkout the repository with permission to push
      - name: Checkout
        uses: actions/checkout@v4

      # Run Diffblue Cover
      - name: Diffblue Cover
        uses: diffblue/cover-github-action@main
        env:
          JVM_ARGS: -Xmx4096m
        with:
          # The access token used to push commits and call GitHub APIs.
          #
          # Must have access to the project with at least Write role, and scopes
          # including code, commit-statuses, pull-requests, workflows and actions.
          access-token: ${{ secrets.DIFFBLUE_ACCESS_TOKEN }}

          # The license key provided in your welcome email or provided by your organization.
          # Alternatively obtain a free trial key from https://www.diffblue.com/try-cover/github.
          license-key: ${{ secrets.DIFFBLUE_LICENSE_KEY }}

          # Working directory where the project can be found, if not at the root.
          # working-directory: path/to/project

          # The Diffblue Cover commands and options to use.
          # Below is the default behavior, uncomment these and edit to customize
          # how Diffblue Cover is run on your project.
          #args: >-
          #  ci
          #  activate
          #  build
          #  validate
          #  create

      # Collect Diffblue Cover outcome files
      # This step saves Diffblue Cover run outcome files for later use. These include summary
      # information on Diffblue Cover's results, reports files, and logs. The information
      # contained in these files can be used for project analysis, metrics, improving analysis
      # or troubleshooting problems.
      # Note that this job will always run even when the Run Diffblue Cover job fails. This
      # ensures troubleshooting logs and output are available.
      - name: Diffblue Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: logs
          path: |
            **/.diffblue/**
```

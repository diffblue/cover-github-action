# Cover GitHub Action

This project provides a GitHub Action for running Diffblue Cover.

## Usage

In it's simplest form the "batteries included" action is intended to be used in a workflow to run all things Diffblue Cover:

```yaml
name: Example Workflow
on:
  pull_request:
jobs:
  Test Job:
    runs-on: ubuntu-latest
    steps:
      - name: Diffblue Cover
        uses: diffblue/cover-github-action@main
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          # License key used to activate the installation
          license-key: ${{ secrets.DIFFBLUE_LICENSE_KEY }}
          # User name and email used to author commits
          user-name: Diffblue CI
          user-email: db-ci-platform@diffblue.com
```

For custom or complex workflows there are also a collection of component actions available to control installation or a single `dcover` subcommand:

- `diffblue/cover-github-action/install@main` - installs the `dcover` command into the `PATH`.
- `diffblue/cover-github-action/activate@main` - runs `dcover activate`.
- `diffblue/cover-github-action/clean@main` - runs `dcover clean`.
- `diffblue/cover-github-action/validate@main` - runs `dcover validate`.
- `diffblue/cover-github-action/create@main` - runs `dcover create`.
- `diffblue/cover-github-action/summary@main` - posts a summary to the GitHub workflow.

The actions only supports `pull_request` events, and will do nothing for if run under other events.

An artifact e.g. `diffblue-cover-action-example-workflow-test-job.zip` containing Diffblue Cover related logs and reports will be uploaded to GitHub for each run will be uploaded to GitHub.
These artifacts can be downloaded from the bottom of the GitHub Actions workflow summary page, and will be essential when requesting support.
See https://www.diffblue.com/support/ to access support.

Note that using actions ending in `@main` runs the very latest version of the actions and is not recommended. Once the actions are released and published then the examples above should be updated to use `@v1` or similar.

## Development

### Latest Build Status

- ![Build](https://github.com/diffblue/cover-github-action/workflows/Build/badge.svg)
- ![Test: Maven-Project](https://github.com/diffblue/cover-github-action/actions/workflows/Test-Maven-Project.yml/badge.svg)
- ![Test: Gradle-Project](https://github.com/diffblue/cover-github-action/actions/workflows/Test-Gradle-Project.yml/badge.svg)

### Development

First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies:
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Ensure you've run this and committed the resulting `dist/*` files. 
These transpiled JavaScript files are the ones run by GitHub Actions and are required to match the TypeScript sources.

Run the tests:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

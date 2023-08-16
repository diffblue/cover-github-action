# Cover GitHub Action

This project provides a GitHub Action for running Diffblue Cover.

## Usage

The action is intended to be used from a GitHub Actions workflow `example.yml`:

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

The action only supports `pull_request` events, and will do nothing for if run under other events.

An artifact e.g. `diffblue-cover-action-example-workflow-test-job.zip` containing Diffblue Cover related logs and reports will be uploaded to GitHub for each run will be uploaded to GitHub.
These artifacts can be downloaded from the bottom of the GitHub Actions workflow summary page, and will be essential when requesting support.
See https://www.diffblue.com/support/ to access support.

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

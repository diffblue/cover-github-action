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
      - name: Checkout
        uses: actions/checkout@v3
        with:
          # The default GITHUB_TOKEN doesn't have the necessary permissions
          # so a custom token should be used here with sufficient access.
          token: ${{ secrets.DIFFBLUE_TOKEN }}
          # By default the merge commit is checked out, but here we want
          # the HEAD SHA in preparation for adding commits to the branch.
          ref: ${{ github.event.pull_request.head.sha }}

      - name: Setup Git Config
        # Adding commits to the branch requires an author name and email address.
        run: |
          git config user.name "Diffblue CI"
          git config user.email "db-ci-platform@diffblue.com"

      - name: Diffblue Cover
        uses: diffblue/cover-github-action@main
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          # License key used to activate the installation
          license-key: ${{ secrets.DIFFBLUE_LICENSE_KEY }}
```

For custom or complex workflows there are also a collection of component actions available to control installation or a single `dcover` subcommand:

- `diffblue/cover-github-action/install@main` - installs the `dcover` command into the `PATH`.
- `diffblue/cover-github-action/activate@main` - runs `dcover activate`.

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

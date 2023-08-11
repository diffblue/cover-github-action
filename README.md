# Cover GitHub Action

This project provides a GitHub Action for running Diffblue Cover.

## Usage

The action is intended to be used from a GitHub Actions workflow `example.yml`:

```yaml
name: Example Workflow
on:
  pull_request:
jobs:
  Test:
    runs-on: ubuntu-latest
    steps:
      - name: Diffblue Cover
        uses: diffblue/cover-github-action@main
        with:
          license-key: ${{ secrets.DIFFBLUE_LICENSE_KEY }}
```

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

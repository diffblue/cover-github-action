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

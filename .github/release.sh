#!/bin/bash

REPO="diffblue/cover-github-action"
BRANCH_NAME="release/$1"
PR_TITLE="Release $1"
PR_BODY="Update Diffblue Cover to $1"

git checkout -b "$BRANCH_NAME"

sed -i "s/cli:[0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}-jdk/cli:$1-jdk/g" Dockerfile

./build.sh
git add Dockerfile
git add */Dockerfile
git commit -m "Bump docker image to $1"

git push origin "$BRANCH_NAME"

curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
     -d '{"title": "'"$PR_TITLE"'", "body": "'"$PR_BODY"'", "head": "'"$BRANCH_NAME"'", "base": "main"}' \
     "https://api.github.com/repos/$REPO/pulls"

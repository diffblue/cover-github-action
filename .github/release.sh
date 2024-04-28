#!/bin/bash

REPO="diffblue/cover-github-action"
BRANCH_NAME="release/$1"
PR_TITLE="Release $1"
PR_BODY="Update Diffblue Cover to $1"
RELEASE_VERSION=$(echo "$1" | sed -E 's/^([0-9]+\.[0-9]+\.[0-9]+).*$/\1/')

if [[ $1 =~ "-RC" ]]; then
     echo "Testing release candidate"
     BRANCH_NAME="testing/$1"
     PR_TITLE="Testing $1"
fi

git checkout -b "$BRANCH_NAME"

if [[ $1 =~ "-RC" ]]; then
     sed -i "s/cli:[0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}-jdk/cli:$RELEASE_VERSION-${1,,}-jdk/g" Dockerfile
     sed -i "s|diffblue\/cover-cli:|docker.io/diffblue\/internal-cover-cli:release-|g" Dockerfile
else
     sed -i "s/cli:[0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}-jdk/cli:$1-jdk/g" Dockerfile
fi

./build.sh
git add Dockerfile
git add */Dockerfile
git commit -m "Bump docker image to $1"

git push origin "$BRANCH_NAME"

curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
     -d '{"title": "'"$PR_TITLE"'", "body": "'"$PR_BODY"'", "head": "'"$BRANCH_NAME"'", "base": "main"}' \
     "https://api.github.com/repos/$REPO/pulls"

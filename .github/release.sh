#!/bin/bash

REPO="diffblue/cover-github-action"
BRANCH_NAME="release/$1"
PR_TITLE="Release $1"
PR_BODY="Update Diffblue Cover to $1"

# If a second parameter is provided then we create an "testing" PR instead of a "release" PR
if [ -n "$2" ]; then
     echo "Testing internal build"
     BRANCH_NAME="testing/$1"
     PR_TITLE="Testing $1"
fi

git checkout -b "$BRANCH_NAME"

if [ -n "$2" ]; then
     # If testing an internal build the version of the docker image will be the branch name followed by the version (all lower case with "/"s replaced by "-"s)
     DOCKER_VERSION=$(echo "${2,,}-${1,,}" | sed 's/\//-/g')
     sed -i "s/cli:[0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}-jdk/cli:$DOCKER_VERSION-jdk/g" Dockerfile
     sed -i "s|diffblue\/cover-cli:|docker.io/diffblue\/internal-cover-cli:|g" Dockerfile
else
     sed -i "s/cli:[0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}-jdk/cli:$1-jdk/g" Dockerfile
fi

# Push changes made to root Dockerfile to all children
./build.sh
git add Dockerfile
git add */Dockerfile
git commit -m "Bump docker image to $1"

git push origin "$BRANCH_NAME"

curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
     -d '{"title": "'"$PR_TITLE"'", "body": "'"$PR_BODY"'", "head": "'"$BRANCH_NAME"'", "base": "main"}' \
     "https://api.github.com/repos/$REPO/pulls"

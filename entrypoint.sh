#!/bin/sh -l

set -ex

# Mark the workspace as safe
/usr/bin/git config --system --add safe.directory `pwd`

# Hmmmmm... fetch the next few refs just to get started
git fetch --all --deepen=5

# Reset the image-specific environment
export $(cat /.env | xargs)

# Just change directory here because it's easier than
# correctly adding --working-directory to each command
cd "${DIFFBLUE_WORKING_DIRECTORY}"

# The command to run. Should ci and activate be mandatory?
/opt/cover/dcover ${INPUT_ARGS}

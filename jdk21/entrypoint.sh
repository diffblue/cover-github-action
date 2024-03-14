#!/bin/sh -l

set -ex

# Mark the workspace as safe
/usr/bin/git config --system --add safe.directory `pwd`

# Reset the image-specific environment
export $(cat /.env | xargs)

# The command to run. Should ci and activate be mandatory?
/opt/cover/dcover ${INPUT_ARGS}

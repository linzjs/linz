#!/usr/bin/env bash

# Only run on Codefresh
if [[ ! -z "$CI_BUILD_ID" ]]; then
    source $PWD/devops/codecov.sh
else
    exit 0
fi

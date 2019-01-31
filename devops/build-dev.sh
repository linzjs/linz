#!/usr/bin/env bash

# Build image.
docker build -f Dockerfile.dev -t linz-dev $PWD

#!/usr/bin/env bash

echo "Starting Redis ..."
docker run --rm --name redis --network linz -v $PWD/devops/data/cache:/data -d redis:4.0-alpine redis-server --appendonly yes

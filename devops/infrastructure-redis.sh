#!/usr/bin/env bash

NAME="redis-dev"
NETWORK_NAME="linz-dev"

if [[ $TARGET_ENV == "test" ]]; then
    NAME="redis"
    NETWORK_NAME="linz"
fi

echo "Starting Redis ..."
docker run --rm --name $NAME --network $NETWORK_NAME -v $PWD/devops/data/cache:/data -d redis:4.0-alpine redis-server --appendonly yes

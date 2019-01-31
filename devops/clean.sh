#!/usr/bin/env bash

MONGODB_NAME="mongodb-dev"
REDIS_NAME="redis-dev"

if [[ $TARGET_ENV == "test" ]]; then
    MONGODB_NAME="mongodb"
    REDIS_NAME="redis"
fi

# Stop the infrastructure
echo "Stopping containers."
docker container stop $MONGODB_NAME || true
docker container stop $REDIS_NAME || true

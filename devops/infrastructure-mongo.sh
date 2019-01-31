#!/usr/bin/env bash

echo "Starting MongoDB ..."

if [ $TARGET_ENV == "test" ]; then

    # When in test mode, always run with a fresh database.
    docker run --rm --name mongodb --network linz -d mongo:3.6 mongod --smallfiles --nojournal

else

    docker run --rm --name mongodb --network linz -v $PWD/devops/data/db:/data/db -d mongo:3.6 mongod --smallfiles --nojournal

fi

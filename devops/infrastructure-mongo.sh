#!/usr/bin/env bash

echo "Starting MongoDB ..."

NAME="mongodb-dev"
NETWORK_NAME="linz-dev"

if [[ $TARGET_ENV == "test" ]]; then
    NAME="mongodb"
    NETWORK_NAME="linz"
fi

if [[ $TARGET_ENV == "test" ]]; then

    # When in test mode, always run with a fresh database.
    docker run --rm --name $NAME --network $NETWORK_NAME -d mongo:3.6 mongod --smallfiles --nojournal

else

    docker run --rm --name $NAME --network $NETWORK_NAME -v $PWD/devops/data/db:/data/db -d mongo:3.6 mongod --smallfiles --nojournal

fi

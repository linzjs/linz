#!/usr/bin/env bash

NETWORK_NAME="linz-dev"

if [[ $TARGET_ENV == "test" ]]; then
    NETWORK_NAME="linz"
fi

if [ ! "$(docker network ls -q -f name=$NETWORK_NAME)" ]; then

  echo "Creating $NETWORK_NAME network ..."

  docker network create $NETWORK_NAME

else

  echo "$NETWORK_NAME network exists, skipping..."

fi

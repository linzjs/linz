#!/usr/bin/env bash

if [ "$(docker ps -aq -f name=mongodb)" ]; then

    echo "MongoDB container exists, starting ..."

    docker start mongodb

else

    echo "Creating MongoDB container ..."

    docker run --name mongodb --network linz -v $PWD/devops/data/db:/data/db -d mongo:3.6 mongod --smallfiles --nojournal

fi

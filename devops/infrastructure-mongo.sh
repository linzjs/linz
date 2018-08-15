#!/usr/bin/env bash

if [ "$(docker ps -aq -f name=mongodb)" ]; then

    echo "MongoDB container exists, starting ..."

    docker start mongodb

else

    echo "Creating MongoDB container ..."

    docker run --name mongodb --network linz -d mongo:3.6

fi

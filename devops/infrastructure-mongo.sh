#!/usr/bin/env bash

if [ ! "$(docker ps -q -f name=mongodb)" ]; then

    if [ "$(docker ps -aq -f status=exited -f name=mongodb)" ]; then
        docker rm mongodb
    fi

    docker run --name mongodb -d mongo:3.6

fi

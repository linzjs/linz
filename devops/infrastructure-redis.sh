#!/usr/bin/env bash

if [ ! "$(docker ps -q -f name=redis)" ]; then

    if [ "$(docker ps -aq -f status=exited -f name=redis)" ]; then
        docker rm redis
    fi

    docker run --name redis -d redis:4.0-alpine

fi

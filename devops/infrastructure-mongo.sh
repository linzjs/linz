#!/usr/bin/env bash

echo "Starting MongoDB ..."
docker run --rm --name mongodb --network linz -v $PWD/devops/data/db:/data/db -d mongo:3.6 mongod --smallfiles --nojournal

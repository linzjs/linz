#!/usr/bin/env bash

# Is it already running?
docker ps | grep mongo > /dev/null 2>&1

# Check the previous command
if [ $? -ne 0 ]; then

    echo "Mongo is not running... starting it now..."

    # We're not sure of the exact state it's in, so let's stop and remove Mongo.
    docker stop mongo > /dev/null 2>&1
    docker rm mongo > /dev/null 2>&1

    # Let's get it running again.
    docker run -d --name mongo -p 27777:27017 mvertes/alpine-mongo:3.2.10-3 > /dev/null 2>&1

    echo "Mongo started... sleeping for 10s to allow it to initialize..."

    # Wait for Mongo to be running in the container.
    sleep 10

fi

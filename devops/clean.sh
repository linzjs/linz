#!/usr/bin/env bash

# Stop the infrastructure
echo "Stopping containers."
docker container stop mongodb
docker container stop redis

#!/usr/bin/env bash

# Stop the infrastructure
echo "Tests finished, stopping containers."
docker stop mongodb
docker stop redis

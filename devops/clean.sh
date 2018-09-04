#!/usr/bin/env bash

# Stop the infrastructure
echo "Stopping containers."
docker stop mongodb
docker stop redis

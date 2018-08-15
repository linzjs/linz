#!/usr/bin/env bash

if [ ! "$(docker network ls -q -f name=linz)" ]; then

  echo "Creating Linz network ..."

  docker network create linz

else

  echo "Linz network exists, skipping..."

fi

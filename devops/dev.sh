#!/usr/bin/env bash

# Setup the infrastructure.
for script in "infrastructure-network.sh" "infrastructure-mongo.sh" "infrastructure-redis.sh"; do
    source "$PWD/devops/${script}"
done

# Link the infrastructure and run the image.
# Stop the containers even if the tests fail.
docker run -it --name linz-dev --network linz-dev -v $PWD/public:/app/node_modules/linz/public -v $PWD/views:/app/node_modules/linz/views --rm -p 8888:8888 linz-dev

# Clean up.
source $PWD/devops/clean.sh

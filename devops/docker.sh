#!/usr/bin/env bash

# Setup the infrastructure.
for script in "infrastructure-network.sh" "infrastructure-mongo.sh" "infrastructure-redis.sh"; do
    source "$PWD/devops/${script}"
done

# Link the infrastructure and run the image.
# Stop the containers even if the tests fail.
docker run -it --name linz --network linz --rm -p 8888:8888 linz

# Store the exit status of the tests.
exitWith=$?

# Clean up.
source $PWD/devops/clean.sh

# Now we can exit, with the status of the tests.
exit $exitWith

#!/usr/bin/env bash

# Setup the infrastructure.
for script in "infrastructure-network.sh" "infrastructure-mongo.sh" "infrastructure-redis.sh"; do
    source "$PWD/devops/${script}"
done

# Link the infrastructure and run the image.
# Stop the containers even if the tests fail.
docker run -it --name linz-dev --network linz-dev -v $PWD/app/lib:/app/lib -v $PWD/app/models:/app/models -v $PWD/app/routes:/app/routes -v $PWD/app/schemas:/app/schemas -v $PWD/app/views:/app/views -v $PWD/app/app.js:/app/app.js -v $PWD/app/server.js:/app/server.js -v $PWD/public:/app/node_modules/linz/public -v $PWD/lib:/app/node_modules/linz/lib -v $PWD/lib:/linz/lib -v $PWD/middleware:/app/node_modules/linz/middleware -v $PWD/middleware:/linz/middleware -v $PWD/params:/app/node_modules/linz/params -v $PWD/params:/linz/params -v $PWD/public:/app/node_modules/linz/public -v $PWD/public:/linz/public -v $PWD/routes:/app/node_modules/linz/routes -v $PWD/routes:/linz/routes -v $PWD/views:/app/node_modules/linz/views -v $PWD/views:/linz/views -v $PWD/linz.js:/app/node_modules/linz/linz.js -v $PWD/linz.js:/linz/linz.js --rm -p 8888:8888 linz-dev

# Clean up.
source $PWD/devops/clean.sh

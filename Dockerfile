FROM node:8-alpine

# Setup dockerize.
# Keep bash and curl to run the codecov bash script.
ENV DOCKERIZE_VERSION v0.6.0
RUN apk add --no-cache bash curl openssl && \
    curl -sSL https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar -C /usr/local/bin -xzvf - && \
    apk del openssl

# Only install packages if there is an update.
COPY /package.json /yarn.lock /app/
WORKDIR /app
# Remove the flags once the packages have been updated and the errors no longer occur.
RUN yarn

# Add linz to the node_modules so we can use it via require('linz')
COPY /lib /app/node_modules/linz/lib
COPY /middleware /app/node_modules/linz/middleware
COPY /params /app/node_modules/linz/params
COPY /public /app/node_modules/linz/public
COPY /routes /app/node_modules/linz/routes
COPY /views /app/node_modules/linz/views
COPY /linz.js /app/node_modules/linz/linz.js
COPY /package.json /app/node_modules/linz/package.json

COPY /app /app

RUN ls -al /app

CMD dockerize -wait tcp://mongodb:27017 -wait tcp://redis:6379 -timeout 20s yarn start

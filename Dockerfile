FROM node:8-alpine

# Setup dockerize.
# Keep bash and curl to run the codecov bash script.
ENV DOCKERIZE_VERSION v0.6.0
RUN apk add --no-cache bash curl openssl && \
    curl -sSL https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar -C /usr/local/bin -xzvf - && \
    apk del openssl

WORKDIR /linz

COPY /.gitignore /.npmignore /codecov.yml /jest.config.js /linz.js /package.json /yarn.lock /CHANGELOG.md /README.md /LICENSE.md /linz/

RUN yarn

COPY /devops /linz/devops
COPY /lib /linz/lib
COPY /middleware /linz/middleware
COPY /params /linz/params
COPY /public /linz/public
COPY /routes /linz/routes
COPY /views /linz/views
COPY /test /linz/test

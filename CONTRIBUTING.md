# Contributing to Linz

Linz has a complete development environment, within this repository. The following is required to begin developing Linz:

- Docker.
- Bash.
- Node.js.
- Yarn or NPM.

Once you've cloned this repository to your host, run `yarn start` or `npm run start` and once the container has started, you will be able to visit the dev environment at `localhost:8888`.

Initially you will need to import some data using `http://localhost:8888/reset`.

Use `test` as the username, and `password` as the password when logging in.

To reset all data, simply visit `http://localhost:8888/reset` again.

## Testing

To run the tests locally, execute `yarn test`. This will start up a Docker container and run the tests within it.

Tests are automatically run on each push to Git too.

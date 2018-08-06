# Contributing to Linz

Linz has a complete development environment, within this repository. The following is required to begin developing Linz:

- Docker.
- Bash.
- Node.js.
- Yarn or NPM.

Once you've cloned this repository to your host, run `yarn dev` or `npm run dev` and once the container has started, you will be able to visit the dev environment at `localhost:8888`.

Use `test` as the username, and `password` as the password when logging in.

To re-run the import script and reset the default records, simply visit `http://localhost:8888` again.

## Testing

To run the tests locally, execute `yarn test`. This will start up a Docker container and run the tests within it.

Tests are automatically run on each push to Git too.

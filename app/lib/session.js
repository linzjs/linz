'use strict';

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const Redis = require('./redis');

module.exports = session({
    resave: false,
    saveUninitialized: false,
    secret: 'sessionsecret',
    store: new RedisStore({ client: new Redis() }),
});

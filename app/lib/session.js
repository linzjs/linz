'use strict';

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const Redis = require('./redis');
const linzDefaults = require('linz/lib/defaults');

const store = new RedisStore({ client: new Redis() });
const sessionOptions = { ...linzDefaults['session options'], ...{ store } };

module.exports = session(sessionOptions);

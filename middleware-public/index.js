'use strict';

const authenticate = require('./authenticate');
const error = require('./error');
const exclusions = require('./exclusions');
const logError = require('./log-error');
const login = require('./login');
const logout = require('./logout');
const notifications = require('./notifications');
const originalUrl = require('./original-url');

module.exports = {
    authenticate,
    error,
    exclusions,
    logError,
    login,
    logout,
    notifications,
    originalUrl,
};

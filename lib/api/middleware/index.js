'use strict';

const authenticate = require('./authenticate');
const csrf = require('./csrf');
const error = require('./error');
const exclusions = require('./exclusions');
const logError = require('./log-error');
const login = require('./login');
const logout = require('./logout');
const notifications = require('./notifications');
const originalUrl = require('./original-url');
const setLinzModel = require('./set-linz-model');
const setLinzNamespace = require('./set-linz-namespace');
const setModelForm = require('./set-model-form');
const setRecord = require('./set-record');

module.exports = {
    authenticate,
    csrf,
    error,
    exclusions,
    logError,
    login,
    logout,
    notifications,
    originalUrl,
    setLinzModel,
    setLinzNamespace,
    setModelForm,
    setRecord,
};

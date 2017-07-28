'use strict';

var express = require('express'),
    linz = require('../'),
    routes = require('../routes'),
    middleware = require('../middleware'),
    params = require('../params'),
    router;

exports.getRouter = function () {

    if (router === undefined) {
        router = express.Router();
    }

    return router;

};

exports.setupParams = function () {

    Object.keys(params).forEach(function (param) {
        params[param](router);
    });

};

exports.setupAdminRoutes = function () {

    // map forgotten password
    router.get(linz.get('admin forgot password path'), routes.forgottenPassword.get);
    router.post(linz.get('admin forgot password path'), middleware.forgottenPassword.post, routes.forgottenPassword.post);

    // map password reset
    router.get(linz.get('admin password reset path') + '/:id/:hash', middleware.linz, middleware.passwordReset.get, routes.passwordReset.get);
    router.post(linz.get('admin password reset path'), middleware.passwordReset.post, routes.passwordReset.post);

    router.get('*', middleware.linz, linz.middleware.exclusions(middleware.adminEnsureAuthenticated(), middleware.navigation, middleware.attributes, middleware.scripts, middleware.styles));
    router.post('*', middleware.linz, linz.middleware.exclusions(middleware.adminEnsureAuthenticated(), middleware.navigation, middleware.attributes));
    router.get('/', routes.adminHome);
    router.get('/login', linz.get('login middleware').get);
    router.post('/login', linz.get('login middleware').post);
    router.get('/logout', linz.get('logout middleware').get);

};

exports.setupModelRoutes = function () {

    // model routes
    router.get('/models/list', middleware.permissions('canList', 'models'), routes.modelList);
    router.get('/model/:model/list', middleware.permissions('canList', 'model'), middleware.modelIndex.get, routes.modelIndex);
    router.post('/model/:model/list', middleware.permissions('canList', 'model'), middleware.modelIndex.post, routes.modelIndex);
    router.get('/model/:model/new', middleware.permissions('canCreate', 'model'), middleware.modelCreate(), routes.modelCreate);
    router.post('/model/:model/create', middleware.permissions('canCreate', 'model'), middleware.modelSave(), routes.modelSave);
    router.get('/model/:model/export', middleware.permissions('canExport', 'model'), middleware.modelExport.get, routes.modelExport.get);
    router.post('/model/:model/export', middleware.permissions('canExport', 'model'), middleware.modelExport.post);

    // record routes
    router.get('/model/:model/:id/overview', middleware.permissions('canView', 'model'), middleware.recordOverview(), routes.recordOverview);
    router.get('/model/:model/:id/edit', middleware.permissions('canEdit', 'model'), middleware.recordEdit(), routes.recordEdit);
    router.post('/model/:model/:id/save', middleware.permissions('canEdit', 'model'), middleware.recordSave(), routes.recordSave);
    router.get('/model/:model/:id/delete', middleware.permissions('canDelete', 'model'), middleware.recordDelete(), routes.recordDelete);
    router.get('/model/:model/:id/json', middleware.permissions('canViewRaw', 'model'), routes.recordJSON);

    // custom actions for records
    router.get('/model/:model/:id/action/:action', middleware.permissions('action', 'model'));

    // version routes
    router.get('/model/:model/:id/versions-compare/:revisionAId/:revisionBId', middleware.modelVersionsCompare.get, routes.modelVersionsCompare.get);
    router.get('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.modelVersionsRollback.get, routes.modelVersionsRollback.get);
    router.post('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.modelVersionsRollback.post, routes.modelVersionsRollback.post);

    // concurrency control routes
    router.post('/model/:model/:id/change/:versionNo?', middleware.recordChange);
    router.get('/merge-data-conflict-guide', routes.mergeDataConflictGuide);

};

exports.setupConfigsRoutes = function () {

    // config routes
    router.get('/configs/list', middleware.permissions('canList', 'configs'), middleware.configList(), routes.configList);
    router.get('/config/:config/overview', middleware.permissions('canView', 'config'), middleware.configOverview(), routes.configOverview);
    router.get('/config/:config/edit', middleware.permissions('canEdit', 'config'), middleware.configEdit(), routes.configEdit);
    router.post('/config/:config/save', middleware.permissions('canEdit', 'config'), middleware.configSave(), routes.configSave);
    router.get('/config/:config/default', middleware.permissions('canReset', 'config'), middleware.configDefault(), routes.configDefault);
    router.get('/config/:config/json', middleware.permissions('canViewRaw', 'config'), routes.configJSON);

};

exports.setupLoggingRoutes = function (logPath) {

    router.get('/logs/request/list', middleware.requestLog(logPath), routes.requestLog);

};

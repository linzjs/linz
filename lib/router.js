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
    router.get(linz.get('admin password reset path') + '/:id/:hash', linz.api.middleware.setLinzNamespace(), middleware.passwordReset.get, routes.passwordReset.get);
    router.post(linz.get('admin password reset path'), middleware.passwordReset.post, routes.passwordReset.post);

    router.get('*', linz.api.middleware.setLinzNamespace(), linz.middleware.exclusions(middleware.adminEnsureAuthenticated(), middleware.navigation, middleware.attributes), linz.api.middleware.notifications);
    router.post('*', linz.api.middleware.setLinzNamespace(), linz.middleware.exclusions(middleware.adminEnsureAuthenticated(), middleware.navigation, middleware.attributes));
    router.get('/', routes.adminHome);
    router.get('/login', linz.get('login middleware').get);
    router.post('/login', linz.get('login middleware').post);
    router.get('/logout', linz.get('logout middleware').get);

};

exports.setupModelRoutes = function () {

    router.use('/model/:model', linz.api.middleware.setLinzModel());

    // model routes
    router.get('/models/list', middleware.permissions('canList', 'models'), middleware.routesHook, routes.modelList);
    router.get('/model/:model/list', middleware.namespaceList, middleware.permissions('canList', 'model'), middleware.modelIndex.get, middleware.routesHook, routes.modelIndex);
    router.post('/model/:model/list', middleware.namespaceList, middleware.permissions('canList', 'model'), middleware.modelIndex.post, middleware.routesHook, routes.modelIndex);
    router.get('/model/:model/new', middleware.permissions('canCreate', 'model'), middleware.routesHook, routes.modelCreate);
    router.post('/model/:model/create', middleware.permissions('canCreate', 'model'), linz.api.middleware.setModelForm(), middleware.routesHook, routes.modelSave);
    router.get('/model/:model/export', middleware.permissions('canExport', 'model'), middleware.modelExport.get, middleware.routesHook, routes.modelExport.get);
    router.post('/model/:model/export', middleware.permissions('canExport', 'model'), middleware.routesHook, middleware.modelExport.post);

    // record routes
    router.get('/model/:model/:id/overview', middleware.namespaceOverview, middleware.permissions('canView', 'model'), middleware.recordOverview(), middleware.routesHook, routes.recordOverview);
    router.get('/model/:model/:id/edit', middleware.permissions('canEdit', 'model'), middleware.recordEdit(), middleware.routesHook, routes.recordEdit);
    router.post('/model/:model/:id/save', middleware.permissions('canEdit', 'model'), linz.api.middleware.setModelForm(), linz.api.middleware.setRecord(), middleware.routesHook, routes.recordSave);
    router.post('/model/:model/:id/delete', middleware.permissions('canDelete', 'model'), middleware.recordDelete(), middleware.routesHook, routes.recordDelete);
    router.get('/model/:model/:id/json', middleware.permissions('canViewRaw', 'model'), middleware.routesHook, routes.recordJSON);

    // custom actions for records
    router.get('/model/:model/:id/action/:action', middleware.permissions('action', 'model'), middleware.routesHook);

    // version routes
    router.get('/model/:model/:id/versions-compare/:revisionAId/:revisionBId', middleware.modelVersionsCompare.get, routes.modelVersionsCompare.get);
    router.get('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.modelVersionsRollback.get, routes.modelVersionsRollback.get);
    router.post('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.modelVersionsRollback.post, routes.modelVersionsRollback.post);

    // concurrency control routes
    router.post('/model/:model/:id/change/:versionNo?', linz.api.middleware.setModelForm(), middleware.recordChange);
    router.get('/merge-data-conflict-guide', routes.mergeDataConflictGuide);

};

exports.setupConfigsRoutes = function () {

    // config routes
    router.get('/configs/list', middleware.permissions('canList', 'configs'), middleware.configList(), middleware.routesHook, routes.configList);
    router.get('/config/:config/overview', middleware.permissions('canView', 'config'), middleware.configOverview(), middleware.routesHook, routes.configOverview);
    router.get('/config/:config/edit', middleware.permissions('canEdit', 'config'), middleware.configEdit(), middleware.routesHook, routes.configEdit);
    router.post('/config/:config/save', middleware.permissions('canEdit', 'config'), middleware.configSave(), middleware.routesHook, routes.configSave);
    router.get('/config/:config/default', middleware.permissions('canReset', 'config'), middleware.configDefault(), middleware.routesHook, routes.configDefault);
    router.get('/config/:config/json', middleware.permissions('canViewRaw', 'config'), middleware.routesHook, routes.configJSON);

};

exports.setupLoggingRoutes = function (logPath) {

    router.get('/logs/request/list', middleware.requestLog(logPath), routes.requestLog);

};

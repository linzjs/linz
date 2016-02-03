"use strict";

var express = require('express'),
	routes = require('../routes'),
	middleware = require('../middleware'),
	passport = require('passport'),
	linz = require('../'),
	router;

exports.getRouter = function () {

	if (router === undefined) {
		router = express.Router();
	}

	return router;

};

exports.setupAdminRoutes = function () {

    // map forgotten password
    router.get(linz.get('admin forgot password path'), routes.forgottenPassword.get);
    router.post(linz.get('admin forgot password path'), middleware.forgottenPassword.post, routes.forgottenPassword.post);

    // map password reset
    router.get(linz.get('admin password reset path') + '/:id/:hash', middleware.passwordReset.get, routes.passwordReset.get);
    router.post(linz.get('admin password reset path'), middleware.passwordReset.post, routes.passwordReset.post);

	router.get('*', middleware.linz, linz.middleware.exclusions(middleware.adminEnsureAuthenticated(), middleware.navigation));
	router.post('*', middleware.linz, linz.middleware.exclusions(middleware.adminEnsureAuthenticated(), middleware.navigation));
	router.get('/', routes.adminHome);
	router.get('/login', routes.adminLogin.get);
	router.post('/login', linz.middleware.authenticate('linz-local'));
	router.get('/logout', routes.adminLogout);

};

exports.setupModelRoutes = function () {

	// set the model param on the linz namespace
	router.param('model', function (req, res, next, modelName) {
	    req.linz.model = linz.api.model.get(modelName);
		return next(null);
	});

	// model routes
	router.get('/models/list', routes.modelList);
	router.get('/model/:model/list', middleware.permissions('index', 'model'), middleware.modelIndex.get, routes.modelIndex);
    router.post('/model/:model/list', middleware.permissions('index', 'model'), middleware.modelIndex.post, routes.modelIndex);
	router.get('/model/:model/new', middleware.permissions('create', 'model'), middleware.modelCreate(), routes.modelCreate);
	router.post('/model/:model/create', middleware.permissions('create', 'model'), middleware.modelSave(), routes.modelSave);
    router.get('/model/:model/export', middleware.permissions('export', 'model'), middleware.modelExport.get, routes.modelExport.get);
    router.post('/model/:model/export', middleware.permissions('export', 'model'), middleware.modelExport.post);

	// record routes
	router.get('/model/:model/:id/overview', middleware.permissions('overview', 'model'), middleware.recordOverview(), routes.recordOverview);
	router.get('/model/:model/:id/edit', middleware.permissions('edit', 'model'), middleware.recordEdit(), routes.recordEdit);
	router.post('/model/:model/:id/save', middleware.permissions('edit', 'model'), middleware.recordSave(), routes.recordSave);
	router.get('/model/:model/:id/delete', middleware.permissions('delete', 'model'), middleware.recordDelete(), routes.recordDelete);
	router.get('/model/:model/:id/json', middleware.permissions('json', 'model'), routes.recordJSON);

	// version routes
    router.get('/model/:model/:id/versions-compare/:revisionAId/:revisionBId', middleware.modelVersionsCompare.get, routes.modelVersionsCompare.get);
    router.get('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.modelVersionsRollback.get, routes.modelVersionsRollback.get);
    router.post('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.modelVersionsRollback.post, routes.modelVersionsRollback.post);

	// concurrency control routes
	router.post('/model/:model/:id/change/:versionNo?', middleware.recordChange);
	router.get('/merge-data-conflict-guide', routes.mergeDataConflictGuide);

};

exports.setupConfigsRoutes = function () {

	// set the config param on the linz namespace
	router.param('config', function (req, res, next, configName) {
		req.linz.config = linz.api.configs.get(configName);
		return next(null);
	});

    // config routes
    router.get('/configs/list', middleware.configList(), routes.configList);
    router.get('/config/:config/overview', middleware.permissions('overview', 'config'), middleware.configOverview(), routes.configOverview);
    router.get('/config/:config/edit', middleware.permissions('edit', 'config'), middleware.configEdit(), routes.configEdit);
    router.post('/config/:config/save', middleware.permissions('edit', 'config'), middleware.configSave(), routes.configSave);
    router.get('/config/:config/default', middleware.permissions('reset', 'config'), middleware.configDefault(), routes.configDefault);
    router.get('/config/:config/json', middleware.permissions('json', 'config'), routes.configJSON);

};

exports.setupLoggingRoutes = function (logPath) {

    router.get('/logs/request/list', middleware.requestLog(logPath), routes.requestLog);

};

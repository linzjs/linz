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

	router.get('*', middleware.linz, middleware.navigation, middleware.adminEnsureAuthenticated());
	router.post('*', middleware.linz, middleware.navigation, middleware.adminEnsureAuthenticated());
	router.get('/', routes.adminHome);
	router.get('/login', routes.adminLogin.get);
	router.post('/login', passport.authenticate('linz-local', { failureRedirect: linz.get('admin path') + '/login' }), routes.adminLogin.post);
	router.get('/logout', routes.adminLogout);

};

exports.setupModelRoutes = function () {

	// model routes
	router.get('/models/list', routes.modelList);
	router.get('/model/:model/list', middleware.model, middleware.permissions('index', 'model'), middleware.modelIndex.get, routes.modelIndex);
    router.post('/model/:model/list', middleware.model, middleware.permissions('index', 'model'), middleware.modelIndex.post, routes.modelIndex);
	router.get('/model/:model/new', middleware.model, middleware.permissions('create', 'model'), middleware.modelCreate(), routes.modelCreate);
	router.post('/model/:model/create', middleware.model, middleware.permissions('create', 'model'), middleware.modelSave(), routes.modelSave);
    router.get('/model/:model/export', middleware.model, middleware.permissions('export', 'model'), middleware.modelExport.get, routes.modelExport.get);
    router.post('/model/:model/export', middleware.model, middleware.permissions('export', 'model'), middleware.modelExport.post);

	// record routes
	router.get('/model/:model/:id/overview', middleware.model, middleware.permissions('overview', 'model'), middleware.recordOverview(), routes.recordOverview);
	router.get('/model/:model/:id/edit', middleware.model, middleware.permissions('edit', 'model'), middleware.permissions('edit', 'model'), middleware.recordEdit(), routes.recordEdit);
	router.post('/model/:model/:id/save', middleware.model, middleware.permissions('edit', 'model'), middleware.recordSave(), routes.recordSave);
	router.get('/model/:model/:id/delete', middleware.model, middleware.permissions('delete', 'model'), middleware.recordDelete(), routes.recordDelete);
	router.get('/model/:model/:id/json', middleware.model, middleware.permissions('json', 'model'), routes.recordJSON);

	// version routes
    router.get('/model/:model/:id/versions-compare/:revisionAId/:revisionBId', middleware.model, middleware.modelVersionsCompare.get, routes.modelVersionsCompare.get);
    router.get('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.model, middleware.modelVersionsRollback.get, routes.modelVersionsRollback.get);
    router.post('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.model, middleware.modelVersionsRollback.post, routes.modelVersionsRollback.post);

	// concurrency control routes
	router.post('/model/:model/:id/change/:versionNo?', middleware.model, middleware.recordChange);
	router.get('/merge-data-conflict-guide', routes.mergeDataConflictGuide);


};

exports.setupConfigsRoutes = function () {

    // config routes
    router.get('/configs/list', middleware.configList(), routes.configList);
    router.get('/config/:config/overview', middleware.config, middleware.permissions('overview', 'config'), middleware.configOverview(), routes.configOverview);
    router.get('/config/:config/edit', middleware.config, middleware.permissions('edit', 'config'), middleware.configEdit(), routes.configEdit);
    router.post('/config/:config/save', middleware.config, middleware.permissions('edit', 'config'), middleware.configSave(), routes.configSave);
    router.get('/config/:config/default', middleware.config, middleware.permissions('reset', 'config'), middleware.configDefault(), routes.configDefault);
    router.get('/config/:config/json', middleware.config, middleware.permissions('json', 'config'), routes.configJSON);

};

exports.setupLoggingRoutes = function (logPath) {

    router.get('/logs/request/list', middleware.requestLog(logPath), routes.requestLog);

};

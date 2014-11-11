"use strict";

var express = require('express'),
	routes = require('../routes'),
	middleware = require('../middleware'),
	helpers = require('./helpers'),
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
    router.get(linz.get('admin forgot password path'), helpers.linz(), routes.forgottenPassword.get);
    router.post(linz.get('admin forgot password path'), helpers.linz(), middleware.forgottenPassword.post, routes.forgottenPassword.post);

    // map password reset
    router.get(linz.get('admin password reset path') + '/:id/:hash', helpers.linz(), middleware.passwordReset.get, routes.passwordReset.get);
    router.post(linz.get('admin password reset path'), helpers.linz(), middleware.passwordReset.post, routes.passwordReset.post);

	router.get('*', helpers.linz(), middleware.adminEnsureAuthenticated());
	router.post('*', helpers.linz(), middleware.adminEnsureAuthenticated());
	router.get('/', routes.adminHome);
	router.get('/login', routes.adminLogin.get);
	router.post('/login', passport.authenticate('linz-local', { failureRedirect: linz.get('admin path') + '/login' }), routes.adminLogin.post);
	router.get('/logout', routes.adminLogout);

};

exports.setupModelRoutes = function () {

	// model routes
	router.get('/models/list', routes.modelList);
	router.get('/model/:model/list', middleware.modelIndex.get, routes.modelIndex);
    router.post('/model/:model/list', middleware.modelIndex.post, routes.modelIndex);
	router.get('/model/:model/new', middleware.modelCreate(), routes.modelCreate);
	router.post('/model/:model/create', middleware.modelSave(), routes.modelSave);
    router.get('/model/:model/export', middleware.modelExport.get, routes.modelExport.get);
    router.post('/model/:model/export', middleware.modelExport.post);
    router.get('/model/:model/:id/versions-compare/:revisionAId/:revisionBId', middleware.modelVersionsCompare.get, routes.modelVersionsCompare.get);
    router.get('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.modelVersionsRollback.get, routes.modelVersionsRollback.get);
    router.post('/model/:model/:id/versions-rollback/:revisionAId/:revisionBId', middleware.modelVersionsRollback.post, routes.modelVersionsRollback.post);

	// record routes
	router.get('/model/:model/:id/overview', middleware.recordOverview(), routes.recordOverview);
	router.get('/model/:model/:id/edit', middleware.recordEdit(), routes.recordEdit);
	router.post('/model/:model/:id/save', middleware.recordSave(), routes.recordSave);
	router.get('/model/:model/:id/delete', middleware.recordDelete(), routes.recordDelete);

};

exports.setupConfigsRoutes = function () {

    // config routes
    router.get('/configs/list', middleware.configList(), routes.configList);
    router.get('/config/:config/overview', middleware.configOverview(), routes.configOverview);
    router.get('/config/:config/edit', middleware.configEdit(), routes.configEdit);
    router.post('/config/:config/save', middleware.configSave(), routes.configSave);
    router.get('/config/:config/default', middleware.configDefault(), routes.configDefault);

};

exports.setupLoggingRoutes = function (logPath) {

    router.get('/logs/request/list', middleware.requestLog(logPath), routes.requestLog);

};


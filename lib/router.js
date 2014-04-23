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

	router.get('*', helpers.linz(), middleware.adminEnsureAuthenticated());
	router.post('*', helpers.linz(), middleware.adminEnsureAuthenticated());
	router.get('/', routes.adminHome);
	router.get('/login', routes.adminLogin.get);
	router.post('/login', passport.authenticate('linz-local', { failureRedirect: linz.get('admin path') + '/login' }), routes.adminLogin.post);
	router.get('/logout', routes.adminLogout);

};

exports.setupModelRoutes = function (models) {

	// model routes
	router.get('/models/list', routes.modelList);
	router.get('/model/:model/list', middleware.modelIndex(models), routes.modelIndex);
	router.get('/model/:model/new', middleware.modelCreate(), routes.modelCreate);
	router.post('/model/:model/create', middleware.modelSave(), routes.modelSave);

	// record routes
	router.get('/:model/:id/overview', middleware.recordOverview(), routes.recordOverview);
	router.get('/:model/:id/edit', middleware.recordEdit(), routes.recordEdit);
	router.post('/:model/:id/save', middleware.recordSave(), routes.recordSave);
	router.get('/:model/:id/delete', middleware.recordDelete(), routes.recordDelete);

};

exports.setupLoggingRoutes = function (logPath) {

	router.get('/logs/request/list', middleware.requestLog(logPath), routes.requestLog);

};
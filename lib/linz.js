
var routes = require('../routes'),
	express = require.main.require('express'),
	path = require('path'),
	helpers = require('./helpers'),
	middleware = require('../middleware'),
	moment = require('moment');

function Linz () {
}

Linz.prototype.init = function (app, models, options) {

	this.app = app;
	this.models = models;
	this.options = options || {};

	this.helpers = helpers;

	// setup admin static route and views
	app.use(this.options.adminPath + '/public', express.static(__dirname + '../public'));

	app.locals({ moment: moment });

	// setup options
	this.setupOptions();

	// setup model admin routes
	this.setupModelRoutes();

}

// setup all of the options
Linz.prototype.setupOptions = function () {

	// debugging
	this.options.debug = this.options.debug || true;

	// setup user configurable settings
	this.options.adminPath = this.options.adminPath || '/admin';

	// setup functions that can be overriden
	this.options.functions = this.options.functions || {};
	this.options.functions.addRoute = this.options.functions.addRoute || this.addRoute;

	// setup route end points that can be overriden
	this.options.routes = this.options.routes || {};
	for (route in routes) {
		this.options.routes[route] = this.options.routes[route] || routes[route];
	}

	// setup shortcuts
	this.o = this.options;
	this.f = this.o.functions;
	this.r = this.o.routes;
	this.u = this.o.urls = {};

}

// setup all of the admin routes
Linz.prototype.setupModelRoutes = function () {

	var models = this.listModels();
	var _this = this;

	// setup the list of models
	this.u.modelsList = this.options.adminPath + '/models/list';
	this.f.addRoute.call(this, this.r.modelList, this.u.modelsList);

	// setup a route for each model index
	this.f.addRoute.call(this, this.r.modelIndex, this.options.adminPath + '/model/:model/list', middleware.modelIndex(this.models));

	// setup a route for each model create
	this.f.addRoute.call(this, this.r.modelCreate, this.options.adminPath + '/model/:model/new', middleware.modelCreate());

	// setup a route for each model create > save
	this.f.addRoute.call(this, this.r.modelSave, this.options.adminPath + '/model/:model/create', middleware.modelSave(), 'post');

	// seutp a route for each model records overview handler
	this.f.addRoute.call(this, this.r.recordOverview, this.options.adminPath + '/:model/:id/overview', middleware.recordOverview());

	// setup a route for each model records edit handler
	this.f.addRoute.call(this, this.r.recordEdit, this.options.adminPath + '/:model/:id/edit', middleware.recordEdit());

	// seutp a route for each model records save handler
	this.f.addRoute.call(this, this.r.recordSave, this.options.adminPath + '/:model/:id/save', middleware.recordSave(), 'post');

}

Linz.prototype.addRoute = function (route, url, middleware, verb) {

	verb = verb || 'get';
	middleware = middleware || [];

	if (this.options.debug) {
		console.log('linz: added route %s', url);
	}

	this.app[verb](url, helpers.linz(this), middleware, route);

}

Linz.prototype.getModels = function () {

	var models = [];

	for (item in this.models) {
		models.push(this.models[item]);
	}

	return models;

}

Linz.prototype.listModels = function () {

	var models = [];

	for (item in this.models) {
		models.push(item);
	}

	return models;

}

Linz.prototype.responseTime = function (path, options) {

	return middleware.responseTime(path, options);

}

var linz = module.exports = exports = new Linz;
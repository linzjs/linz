
var routes = require('../routes'),
	express = require.main.require('express'),
	path = require('path'),
	helpers = require('./helpers'),
	passportHelpers = require('./helpers-passport'),
	middleware = require('../middleware'),
	moment = require('moment'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

function Linz (app, models, options) {

	this.app = app;
	this.models = models;
	this.options = options || {};

}

Linz.prototype.init = function () {

	this.helpers = helpers;

	app.locals({ moment: moment });

	// setup options
	this.setupOptions();

	// setup core admin routes
	this.setupAdminRoutes();

	// setup model admin routes
	this.setupModelRoutes();

	// setup logging routes
	this.setupLoggingRoutes();

}

// setup all of the options
Linz.prototype.setupOptions = function () {

	_this = this;

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

	// work in the preOptions, such as request logging
	this.preOptions = this.preOptions || {};

	Object.keys(this.preOptions).forEach(function (opt) {
		_this.options[opt] = _this.preOptions[opt];
	});

	// add linz admin navigation to the app locals
	this.app.locals({
		linzNavigation: [
			{
				name: 'Models',
				href: '/admin/models/list'
			},
			{
				name: 'Logs',
				href: '/admin/logs/request/list'
			},
			{
				name: 'Logout',
				href: '/admin/logout'
			}
		]
	});

}

Linz.prototype.setupAdminRoutes = function () {

	this.f.addRoute.call(this, this.r.adminHome, this.options.adminPath);

	this.f.addRoute.call(this, this.r.adminLogin.get, this.options.adminPath + '/login');

	this.f.addRoute.call(this, this.r.adminLogin.post, this.options.adminPath + '/login', passport.authenticate('local', { failureRedirect: this.options.adminPath + '/login', successRedirect: this.options.adminPath }), 'post');

	this.f.addRoute.call(this, this.r.adminLogout, this.options.adminPath + '/logout');

};

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

Linz.prototype.setupLoggingRoutes = function () {

	// setup the request logging route
	if (this.options.requestLogging) {
		this.f.addRoute.call(this, this.r.requestLog, this.options.adminPath + '/logs/request/list', middleware.requestLog(this.options.requestLogging));
	}

}

Linz.prototype.addRoute = function (route, url, mw, verb) {

	verb = verb || 'get';
	mw = mw || [];

	if (this.options.debug) {
		console.log('linz: added route %s', url);
	}

	this.app[verb](url, helpers.linz(this), middleware.adminEnsureAuthenticated(), mw, route);

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

	this.preOptions = this.preOptions || {};

	this.preOptions.requestLogging = {
		path: path,
		options: options
	};

	return middleware.responseTime(path, options);

}

Linz.prototype.expressMiddlewareHook = function (app) {

	app.use(passport.initialize());
	app.use(passport.session());

	// setup admin static route and views
	app.use(this.options.adminPath + '/public', express.static(__dirname + '../public'));

	// setup passport for authentication
	passport.use(passportHelpers.login);

	// add serialize and deserialize functionality
	passportHelpers.setupPassport(passport);

}

Linz.prototype.extendTypes = function () {

	require('./models/extendtypes')(true);

};

module.exports = Linz; // = exports = new Linz;
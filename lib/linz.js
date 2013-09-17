
var routes = require('../routes');

function Linz () {
}

Linz.prototype.init = function (app, models, options) {

	this.app = app;
	this.models = models;
	this.options = options || {};

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

}

// setup all of the admin routes
Linz.prototype.setupModelRoutes = function () {

	var models = this.listModels();
	var _this = this;

	models.forEach(function (model) {

		_this.f.addRoute.call(_this, _this.options.adminPath + '/model/' + model + '/list');

	});

}

Linz.prototype.addRoute = function (route, verb) {

	verb = verb || 'get';

	if (this.options.debug) {
		console.log('linz: added route %s', route);
	}

	this.app[verb](route, this.r.modelIndex);

}

Linz.prototype.getModels = function () {

	var models = [];

	for (model in this.models) {
		models.push(this.models[model]);
	}

	return models;

}

Linz.prototype.listModels = function () {

	var models = [];

	for (model in this.models) {
		models.push(model);
	}

	return models;

}

var linz = module.exports = exports = new Linz;
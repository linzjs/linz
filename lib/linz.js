"use strict";

var routes = require('../routes'),
	express = require.main.require('express'),
	routesManager = require('./router'),
	path = require('path'),
	helpers = require('./helpers'),
	middleware = require('../middleware'),
	moment = require('moment'),
	events = require('events'),
	formtools = require('./formtools'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	passportHelpers = require('./helpers-passport'),
	bunyan = require('bunyan'),
	debugModels = require('debug')('linz:models');

// setup shortcut
var linz = Linz.prototype;

// Linz constructor
function Linz () {
}

/**
 * Linz inherits from EventEmitter for linz.on('event') handling
 *
 */
 linz.__proto__ = events.EventEmitter.prototype;

/**
 * Initialize linz with the express app
 *
 */
linz.linz = function (expressApp) {

	this.expressApp = expressApp;

	this.on('admin path', function () {

		this.expressApp.locals({
			linzNavigation: [
				{
					name: 'Models',
					href: this.get('admin path') + '/models/list'
				},
				{
					name: 'Logs',
					href: this.get('admin path') + '/logs/request/list'
				},
				{
					name: 'Logout',
					href: this.get('admin path') + '/logout'
				}
			]
		});

	});

	this.init();

	return this;

};

/**
* Initialize the application
*
* @api private
*/

linz.init = function() {

	this.settings = {};
	this.loggers = {};

	this.defaultConfiguration();
	this.loadModels();
	this.bootstrapExpressLocals();

	this.set('app', this.expressApp);

};

/**
* Search and look for the models folder, then go ahead and load them
*
* @return void
*/
linz.loadModels = function () {

	var modelsPath = this.get('models path') || path.resolve(this.get('cwd'), 'models');

	try {
		this.set('models', require('./formtools/models-load')(modelsPath));
	} catch (e) {
		debugModels('Could not find models in directory, %s.', modelsPath);
	}

};

/**
* Setup the default configuration for Linz
*
* @return void
*/
linz.defaultConfiguration = function () {

	var _this = this;

	// setup the customiseable defaults
	this.set('admin path', '/admin');
	this.set('admin title', 'Linz');

	// setup the router
	this._router = routesManager.getRouter(this);
	this.routes = this._router.map;

	this.__defineGetter__('router', function () {
		// if we haven't run setup before, do it now
		this.bootstrapExpress();
		return this._router.middleware;
	});

	// assign the admin routes
	routesManager.setupAdminRoutes(this);
	// assign the model CRUD routes
	routesManager.setupModelRoutes(this.models);
	// assign the logging routes
	if (this.get('request logging') === true) routesManager.setupLoggingRoutes();

	// store the cwd
	this.set('cwd', process.cwd());

	// place holder for the models, which get loaded in next
	this.set('models', []);

};

/**
* We need to setup the host express app with a few bits and pieces
*
* @api private
*/
linz.bootstrapExpress = function () {

	// only run once
	if (this.bBootstrapExpress) return;
	if (!this.bBootstrapExpress) this.bBootstrapExpress = true;

	// initialize passport
	this.expressApp.use(this.get('admin path'), passport.initialize());
	this.expressApp.use(this.get('admin path'), passport.session());

	// setup stylus for admin css
	this.expressApp.use(this.get('admin path') + '/public/', require('stylus').middleware(path.resolve(__dirname, '..', 'public')));

	// setup admin static routes
	this.expressApp.use(this.get('admin path') + '/public/', express.static(path.resolve(__dirname, '..', 'public')));

	// setup passport for authentication
	passport.use('linz-local', passportHelpers.login);

	// add serialize and deserialize functionality
	passportHelpers.setupPassport(passport);

};

/**
* Setup express locals for admin template generation
*
* @api private
*/
linz.bootstrapExpressLocals = function () {

	// expose our settings to the rendering engine
	this.expressApp.locals({ linz: this });

	// expose the linz admin navigation
	this.expressApp.locals({ linzNavigation: this.buildNavigation() });

};

/**
* Set a value or setting on Linz
*
* @return Linz for chaining
*/

linz.set = function (setting, val) {

	if (1 === arguments.length) {
		return this.settings[setting];
	}

	this.settings[setting] = val;

	// fire an event, so we can respond to certain changes
	this.emit(setting, val);

	return this;

};

/**
* Get a value or setting on Linz
*
* @return setting value
*/

linz.get = function (setting) {
	return this.settings[setting];
};

/*
* Set a settings value to true
* synonym for admin.set('setting', true);
* @return Linz for chaining
*/

linz.enable = function (setting) {
	this.set(setting, true);
	return this;
};

/*
* Set a settings value to false
* synonym for admin.set('setting', false);
* @return Linz for chaining
*/
linz.disable = function (setting) {
	this.set(setting, false);
	return this;
};


/*
* Return the linz navigation structure
*
* @api private
*/
linz.buildNavigation = function () {

	var nav = [],
		_this = this,
		linzModels = this.get('models');

	// add a reference for all of the models
	var models = {
		name: 'Models',
		href: this.get('admin path') + '/models/list',
		children: [
			{
				'name': 'All',
				href: this.get('admin path') + '/models/list'
			}
		]
	};

	// add each model to the navigation tree
	Object.keys(linzModels).forEach(function (model) {

		models.children.push({
			name: linzModels[model].label,
			href: _this.get('admin path') + '/model/' + model + '/list'
		});

	});
	nav.push(models);

	// add a reference for the logs
	var logs = {
		name: 'Logs',
		href: this.get('admin path') + '/logs/request/list'
	};
	nav.push(logs);

	return nav;

}

/**
* Create a logger which you can use in your applications.
* Linz uses bunyan internally and exposes this method to easily create logs within your application.
* 
* @param {String|Object} options
* @return an instance of the logger
* @api public
*/
linz.logger = function (options) {

	// user can pass either a String or an Object
	if (typeof options === 'string') options = {name: options};

	// The name parameter must exist
	if (!options.name) throw new Error('You must pass the name parameter when creating a logger.');

	// If we haven't already created a logger, create one now, transparently passing the options
	if (!this.loggers[options.name]) {
		this.loggers[options.name] = bunyan.createLogger(options);
	}

	return this.loggers[options.name];

};

/**
* Built-in middleware which is optional for the user to use
*
*/
linz.responseTime = function (path, options) {
	
	// define the settings on Linz
	this.enable('request logging');
	this.set('request log path', path);
	this.set('request log options', options);

	// setup the admin route for this
	routesManager.setupLoggingRoutes(path);

	// return the middleware so that express can 'use' it
	return middleware.responseTime(path, options);
};

/**
 * Linz formtools package
 *
 * @property formtools
 * @api public
 */
 linz.formtools = formtools;

/**
 * Expose Linz
 */

exports = module.exports = new Linz;
"use strict";

var routes = require('./routes'),
	express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	expressSession = require('express-session'),
	routesManager = require('./lib/router'),
	path = require('path'),
	helpers = require('./lib/helpers'),
	middleware = require('./middleware'),
	moment = require('moment'),
	events = require('events'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	passportHelpers = require('./lib/helpers-passport'),
	bunyan = require('bunyan'),
	debugModels = require('debug')('linz:models'),
	debugGeneral = require('debug')('linz:general'),
	debugSet = require('debug')('linz:set');

// Linz constructor
function Linz () {

	// internal properties
	this.settings = {};
	this.loggers = {};

}

/**
 * Expose Linz
 */
var linz = module.exports = exports = new Linz;

/**
 * Expose linz modules
 */
linz.formtools = require('./lib/formtools');

/**
 * Linz inherits from EventEmitter for Linz.prototype.on('event') handling
 *
 */
 Linz.prototype.__proto__ = events.EventEmitter.prototype;

/**
 * Initialize linz with the express app
 * signature: app, mongoose, options
 *
 */
Linz.prototype.init = function () {

	var _app,
		_mongoose,
		_options;

	// loop through the arguments, and determine what is what
	for (var i = 0; i < arguments.length; i++) {

		var arg = arguments[i];

		if (arg.constructor.name === 'Mongoose') {
			_mongoose = arg;
		} else if (arg.constructor.name === 'Function' && typeof arg === 'function') {
			_app = arg;
		} else  if (arg.constructor.name === 'Object' && typeof arg === 'object') {
			_options = arg;
		}

	}

	// use anything that is passed in
	_app = _app || express();
	_mongoose = _mongoose || require('mongoose');
	_options = _options || {};

	// reference required properties
	this.app = _app;
	this.mongoose = _mongoose;

	// apply default options
	this.options(_options);

	this.on('admin path', function () {

		this.app.locals['linzNavigation'] = [
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
		];

	});

	this.configure();

	return this;

};

/**
* Initialize the application
*
* @api private
*/

Linz.prototype.configure = function() {

	this.defaultConfiguration();
	this.bootstrapExpress();
	this.mountAdmin();
	this.loadModels();
	this.bootstrapExpressLocals();

	// expose app
	this.set('app', this.app);

	// check for either a connect(ed|ing) mongoose object, or mongoose URI
	if ([1,2].indexOf(this.mongoose.connection.readyState) < 0) {

		if (!this.get('mongo')) {
			throw new Error('You must either supply a connected mongoose object, or a mongo URI');
		}

		this.mongoose.connect(this.get('mongo'));

	}

};

/**
* Search and look for the models folder, then go ahead and load them
*
* @return void
*/
Linz.prototype.loadModels = function () {

	// set the default models path
	this.set('models path', path.resolve(this.get('cwd'), 'models'), false);

	var modelsPath = this.get('models path');

	try {
		this.set('models', require('./lib/formtools/models-load')(modelsPath));
		debugModels('Loaded models from directory, %s', modelsPath);
	} catch (e) {
		debugModels('Error when loading models from directory, %s (%s)', modelsPath, e.toString());
	}

};

/**
* Setup the default configuration for Linz
*
* @return void
*/
Linz.prototype.defaultConfiguration = function () {

	var _this = this;

	debugGeneral('Setting up the default configuration');

	// setup the default admin path, unless already defined
	this.set('admin path', '/admin', false);

	this.set('admin title', 'Linz', false);

	// setup the router
	this.router = routesManager.getRouter(this);

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

Linz.prototype.mountAdmin = function () {

	debugGeneral('Mounting Linz on ' + this.get('admin path'));
	this.app.use(this.get('admin path'), this.router);
};

/**
* We need to setup the host express app with a few bits and pieces
*
* @api private
*/
Linz.prototype.bootstrapExpress = function () {

	// only run once
	if (this.bBootstrapExpress) return;
	if (!this.bBootstrapExpress) this.bBootstrapExpress = true;

	debugGeneral('Bootstrapping express');

	this.app.engine('jade', require('jade').__express);
	this.app.set('view engine', 'jade');

	// setup body-parser, and cookie-parser
	this.app.use(bodyParser());
	this.app.use(cookieParser());

	// need to hook session in here as it must be before passport.initialize
	if (typeof this.get('session') === 'function') {
		this.app.use(this.get('session'));
	} else {
		this.app.use(expressSession({ secret: 'linzcookiesecret' }));
	}

	// initialize passport
	this.app.use(this.get('admin path'), passport.initialize());
	this.app.use(this.get('admin path'), passport.session());

	// setup stylus for admin css
	this.app.use(this.get('admin path') + '/public/', require('stylus').middleware(path.resolve(__dirname, 'public')));

	// setup admin static routes
	this.app.use(this.get('admin path') + '/public/', express.static(path.resolve(__dirname, 'public')));

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
Linz.prototype.bootstrapExpressLocals = function () {

	// expose our settings to the rendering engine
	this.app.locals['linz'] = this;

	// expose the linz admin navigation
	this.app.locals['linzNavigation'] = this.buildNavigation();

	this.app.locals['adminPath'] = this.get('admin path');

	this.app.locals['adminTitle'] = this.get('admin title');

};

Linz.prototype.options = function (opts) {

	var _this = this,
		opts = opts || {};

	for (var opt in opts) {
		_this.set(opt, opts[opt]);
	}

};

/**
* Set a value or setting on Linz
*
* @return Linz for chaining
*/

Linz.prototype.set = function (setting, val, override) {

	if (arguments.length === 1) {
		return this.settings[setting];
	}

	// can only set the following values once
	var onceOnly = ['admin path', 'models path', 'admin title'];

	if (onceOnly.indexOf(setting) >= 0 && this.settings[setting] !== undefined) {
		return debugSet('You can only set \'' + setting + '\' once. Ignoring set this time.');
	}

	// defaults to true
	override = !(override === false);

	// override unless previously set
	if (override || override === false && this.settings[setting] === undefined) {
		debugSet('Setting ' + setting + ' to ' + val);
		this.settings[setting] = val;
		this.emit(setting, val);
	}

	return this;

};

/**
* Get a value or setting on Linz
*
* @return setting value
*/

Linz.prototype.get = function (setting) {
	return this.settings[setting];
};

/*
* Set a settings value to true
* synonym for admin.set('setting', true);
* @return Linz for chaining
*/

Linz.prototype.enable = function (setting) {
	this.set(setting, true);
	return this;
};

/*
* Set a settings value to false
* synonym for admin.set('setting', false);
* @return Linz for chaining
*/
Linz.prototype.disable = function (setting) {
	this.set(setting, false);
	return this;
};


/*
* Return the linz navigation structure
*
* @api private
*/
Linz.prototype.buildNavigation = function () {

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
Linz.prototype.logger = function (options) {

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
Linz.prototype.responseTime = function (path, options) {
	
	// define the settings on Linz
	this.enable('request logging');
	this.set('request log path', path);
	this.set('request log options', options);

	// setup the admin route for this
	routesManager.setupLoggingRoutes(path);

	// return the middleware so that express can 'use' it
	return middleware.responseTime(path, options);
};

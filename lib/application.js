/*jshint -W120 */

"use strict";

var app = exports = module.exports = {},
	path = require('path'),
	express = require.main.require('express'),
	routesManager = require('./router'),
	routes = require('../routes'),
	middleware = require('../middleware'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	passportHelpers = require('./helpers-passport'),
	bunyan = require('bunyan');

/**
* Initialize the application
*
* @api private
*/

app.init = function() {

	this.settings = {};
	this.loggers = {};

	this.defaultConfiguration();

};

/**
* Setup the default configuration for Linz
*
* @return void
*/

app.defaultConfiguration = function () {

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

	// setup access to the models
	this.set('models', this.models);

	// expose our settings to the rendering engine
	this.expressApp.locals({ linz: this.settings });

	// setup navigation
	// add linz admin navigation to the expressApp locals
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
		],
		linz: this
	});

};

/**
* We need to setup the host express app with a few bits and pieces
*
* @api private
*/
app.bootstrapExpress = function () {

	// only run once
	if (this.bBootstrapExpress) return;
	if (!this.bBootstrapExpress) this.bBootstrapExpress = true;

	// initialize passport
	this.expressApp.use(passport.initialize());
	this.expressApp.use(passport.session());

	// setup admin static routes
	this.expressApp.use(this.get('admin path') + '/public/', express.static(path.resolve(__dirname, '..', 'public')));

	// setup passport for authentication
	passport.use(passportHelpers.login);

	// add serialize and deserialize functionality
	passportHelpers.setupPassport(passport);

};

/**
* Set a value or setting on Linz
*
* @return Linz for chaining
*/

app.set = function (setting, val) {

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

app.get = function (setting) {
	return this.settings[setting];
};

/*
* Set a settings value to true
* synonym for admin.set('setting', true);
* @return Linz for chaining
*/

app.enable = function (setting) {
	this.set(setting, true);
	return this;
};

/*
* Set a settings value to false
* synonym for admin.set('setting', false);
* @return Linz for chaining
*/
app.disable = function (setting) {
	this.set(setting, false);
	return this;
};

/**
* Create a logger which you can use in your applications.
* Linz uses bunyan internally and exposes this method to easily create logs within your application.
* 
* @param {String|Object} options
* @return an instance of the logger
* @api public
*/
app.logger = function (options) {

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
app.responseTime = function (path, options) {
	
	// define the settings on Linz
	this.enable('request logging');
	this.set('request log path', path);
	this.set('request log options', options);

	// setup the admin route for this
	routesManager.setupLoggingRoutes(path);

	// return the middleware so that express can 'use' it
	return middleware.responseTime(path, options);
};
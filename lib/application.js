"use strict";

var app = exports = module.exports = {};

/**
 * Initialize the application
 *
 * @api private
 */

app.init = function() {

	this.settings = {};

	this.defaultConfiguration();

};

app.defaultConfiguration = function () {

	// setup the default admin path
	this.set('admin path', '/admin');

};

app.set = function (setting, val) {

	if (1 === arguments.length) {
		return this.settings[setting];
	}

	this.settings[setting] = val;
	return this;

};
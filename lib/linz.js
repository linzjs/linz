"use strict";

var routes = require('../routes'),
	express = require.main.require('express'),
	path = require('path'),
	helpers = require('./helpers'),
	middleware = require('../middleware'),
	moment = require('moment'),
	util = require('util'),
	events = require('events');

function Linz (expressApp, models, options) {

	this.expressApp = expressApp;
	this.models = models;
	this.options = options || {};

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

}

Linz.prototype.extendTypes = function () {

	require('./formtools/extend-types')(true);

};

util.inherits(Linz, events.EventEmitter);

module.exports = Linz;
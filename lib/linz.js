"use strict";

var routes = require('../routes'),
	express = require.main.require('express'),
	path = require('path'),
	helpers = require('./helpers'),
	middleware = require('../middleware'),
	moment = require('moment');

function Linz (expressApp, models, options) {

	this.expressApp = expressApp;
	this.models = models;
	this.options = options || {};

}

Linz.prototype.extendTypes = function () {

	require('./formtools/extend-types')(true);

};

module.exports = Linz;
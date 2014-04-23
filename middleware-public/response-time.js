var winston = require('winston'),
	path = require('path'),
	linz = require('../');

/**
* Built-in middleware which is optional for the user to use
*
*/
module.exports = function (path, options) {
	
	// define the settings on Linz
	linz.enable('request logging');
	linz.set('request log path', path);
	linz.set('request log options', options);

	// setup the admin route for this
	// routesManager.setupLoggingRoutes(path);

	// return the middleware so that express can 'use' it
	return responseTimeMiddleware(path, options);
};

function responseTimeMiddleware (logPath, options) {

	options = options || {};

	if (logPath) {

		options.filename = logPath;

		winston.add(winston.transports.File, options);
		winston.remove(winston.transports.Console);

	}

	return function (req, res, next) {

		var start = Date.now();

		if (req.linz === undefined) req.linz = {};
		if (req.linz.responseTime === undefined) req.linz.responseTime = {};

		// put this into req, so it can be tracked by other middleware
		req.linz.responseTime.start = start;

		res.on('finish', function () {

			var duration = Date.now() - start;

			if (options.exclude && options.exclude.test(req.originalUrl)) {
				return;
			}

			winston.info(req.method + ' ' + req.originalUrl + ' [' + duration + ']');

		});

		next();

	}

};
var winston = require('winston'),
	path = require('path');

module.exports = function responseTime(logPath, options) {

	options = options || {};

	if (logPath) {

		options.filename = logPath;

		winston.add(winston.transports.File, options);
		winston.remove(winston.transports.Console);

	}

	return function (req, res, next) {

		var start = Date.now();

		res.on('finish', function () {

			var duration = Date.now() - start;

			winston.info(req.method + ' ' + req.originalUrl + ' [' + duration + ']');

		});

		next();

	}

};
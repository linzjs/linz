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
var util = require('util'),
	fs = require('fs');

module.exports = function (logPath) {

	return function (req, res, next) {

		fs.readFile(logPath, 'utf8', function (err, data) {

			req.linz.requestLog = data;

			next();

		});

	}

}
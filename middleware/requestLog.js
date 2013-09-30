var util = require('util'),
	fs = require('fs');

module.exports = function (model) {

	return function (req, res, next) {

		fs.readFile(req.linz.options.requestLogging.path, 'utf8', function (err, data) {

			req.linz.requestLog = data;

			next();

		});

	}

}
var path = require('path'),
	linz = require('../');

exports.linz = function () {

	return function (req, res, next) {

		// handy references to anything linz
		req.linz = linz;

		// the linz views directory for admin views
		req.linz.views = path.resolve(__dirname, '..', 'views');

		next();

	};

};

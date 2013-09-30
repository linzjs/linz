var util = require('util');

module.exports = function ensureAuthenticated () {

	return function (req, res, next) {

		if (req.originalUrl === req.linz.options.adminPath + '/login' || req.isAuthenticated()) {
			return next();
		}

		res.redirect(req.linz.options.adminPath + '/login');

	}

}
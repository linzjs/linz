var util = require('util');

module.exports = function ensureAuthenticated () {

	return function (req, res, next) {

		if (req.originalUrl === req.linz.get('admin path') + '/login' || req.isAuthenticated()) {
			return next();
		}

		res.redirect(req.linz.get('admin path') + '/login');

	}

}
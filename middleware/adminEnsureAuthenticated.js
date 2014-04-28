var linz = require('../');

module.exports = function ensureAuthenticated () {

	return function (req, res, next) {

		if (req.originalUrl === linz.get('admin path') + '/login' || req.isAuthenticated() && req.user.hasAdminAccess) {
			return next();
		}

		res.redirect(linz.get('admin path') + '/login');

	};

};
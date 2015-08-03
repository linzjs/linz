var linz = require('../');

module.exports = function ensureAuthenticated () {

	return function (req, res, next) {

		if (req.isAuthenticated() && req.user.hasAdminAccess) {
			return next();
		}

		res.redirect(linz.get('admin path') + '/login');

	};

};

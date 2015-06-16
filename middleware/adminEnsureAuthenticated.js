var linz = require('../');

module.exports = function ensureAuthenticated () {

	return function (req, res, next) {

		// update this to be a regular expression
		// login and public should be let through, everything else redirected
		var allowedUrls = new RegExp("^" + linz.get('admin path').replace(/\//g, '\/') + "\/(login|public)");

		if (allowedUrls.test(req.originalUrl) || req.isAuthenticated() && req.user.hasAdminAccess) {
			return next();
		}

		res.redirect(linz.get('admin path') + '/login');

	};

};

var linz = require('../../../'),
    exclusions = require('./exclusions');

/**
 * This is a very simple middleware and is used to persist the original url a user requested.
 * This is exposed, and used within Linz login handling so that customised login processes can still
 * benefit from built-in Linz login functionality (such as redirecting to a previously protected route).
 * This middleware is wrapped in the exclusions middleware so that it doesn't execute for /admin/login, etc.
 */
module.exports = function (customExclusions) {

	customExclusions = customExclusions || [];

	customExclusions = customExclusions.concat(new RegExp('^' + linz.api.url.getLink().replace(/\//g, '\/') + '\/?$'));

	return exclusions(customExclusions, function (req, res, next) {

        if (!req.isAuthenticated()) {
            console.log('Setting linzReturnUrl cookie with ', linz.get('cookie options'));
			res.cookie('linzReturnUrl', req.originalUrl, linz.get('cookie options'));
		}

		return next();

	})

};

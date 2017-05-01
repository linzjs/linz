'use strict';

const linz = require('../');
const path = require('path');

/**
 * GET /admin
 * Admin route redirect.
 * @param  {Object} req Express Request object.
 * @param  {Object} res Express Response object.
 * @return {Void}       Redirects to the admin home.
 */
const route = (req, res) => {
	return res.redirect(307, path.join(linz.get('admin path'), linz.get('admin home')));
};

module.exports = route;

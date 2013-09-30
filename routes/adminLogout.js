var path = require('path');

/* GET /admin/login */
var route = function (req, res) {

	req.logout();
	res.redirect(req.linz.options.adminPath);

};

module.exports = route;
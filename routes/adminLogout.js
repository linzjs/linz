var path = require('path');

/* GET /admin/login */
var route = function (req, res) {

	req.logout();
	res.redirect(req.linz.get('admin path'));

};

module.exports = route;
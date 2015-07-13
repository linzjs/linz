var linz = require('../');

/* GET /admin/login */
var route = function (req, res) {

	req.logout();
	res.redirect((linz.get('admin path') === '' ? '/': linz.get('admin path')));

};

module.exports = route;

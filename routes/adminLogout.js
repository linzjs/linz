

/* GET /admin/login */
var route = function (req, res) {

	var linz = require('../');

	// log user out
	req.logout();

	// clear req.session
	req.session.destroy();

	// redirect user to login screen
	res.redirect((linz.get('admin path') === '' ? '/' : linz.get('admin path')));

};

module.exports = route;

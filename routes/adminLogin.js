var path = require('path');

/* GET /admin/login */
var route = {

	get: function (req, res) {
		res.render(req.linz.views + '/adminLogin.jade');
	},

	post: function (req, res) {
		res.render('post');
	}

};

module.exports = route;
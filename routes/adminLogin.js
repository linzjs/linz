var linz = require('../'),
    path = require('path');

/* GET /admin/login */
var route = {

	get: function (req, res) {

        // check if resetPassword() is defined for user model
        var hasResetPassword = linz.get('models')[linz.get('user model')].resetPassword;
console.log(hasResetPassword);
		res.render(req.linz.views + '/adminLogin.jade', { hasResetPassword: hasResetPassword });
	},

	post: function (req, res) {
		res.redirect((req.linz.get('admin path') === '' ? '/': req.linz.get('admin path')));
	}

};

module.exports = route;

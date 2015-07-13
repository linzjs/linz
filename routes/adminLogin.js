var linz = require('../');

/* GET /admin/login */
var route = {

	get: function (req, res) {

        // check if resetPassword() is defined for user model
        var hasResetPassword = linz.api.model.get(linz.get('user model')).sendPasswordResetEmail;

		res.render(linz.api.views.viewPath('adminLogin.jade'), { hasResetPassword: hasResetPassword });

	},

	post: function (req, res) {
		res.redirect((linz.get('admin path') === '' ? '/': linz.get('admin path')));
	}

};

module.exports = route;

var linz = require('../'),
    path = require('path'),
    async = require('async');

/* GET /admin/login */
var route = {

	get: function (req, res, next) {

        // check if resetPassword() is defined for user model
        var locals = {
            hasResetPassword: linz.api.model.get(linz.get('user model')).sendPasswordResetEmail
        };

        // pre-render the admin view, ready to plug into the larger wrapper
        async.series([

            function (done) {

                // render either a custom form, or the default Linz form
                (typeof linz.get('admin login view') === 'function') ? linz.get('admin login view').call(null, locals, done) : (function () {

                    linz.app.render(path.resolve(req.linz.views, 'login', 'form.jade'), locals, done);

                })();

            }


        ], function (err, html) {

            if (err) {
                return next(err);
            }

            // now render the final template, within the layout
            return res.render(req.linz.views + '/adminLogin.jade', {
                html: html
            });

        });

	},

	post: function (req, res) {
		res.redirect((req.linz.get('admin path') === '' ? '/': req.linz.get('admin path')));
	}

};

module.exports = route;

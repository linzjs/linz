var path = require('path'),
    async = require('async');

/* GET /admin/login */
var route = {

	get: function (req, res, next) {

        var linz = require('../'),
            locals = {
                customAttributes: res.locals.customAttributes,
                hasResetPassword: linz.api.model.get(linz.get('user model')).sendPasswordResetEmail, // check if resetPassword() is defined for user model
                loginError: req.flash('error'), //set login error message
            };

        // pre-render the admin view, ready to plug into the larger wrapper
        async.series([

            function (done) {

                // render either a custom form, or the default Linz form
                (typeof linz.get('admin login view') === 'function') ? linz.get('admin login view').call(null, req, locals, done) : (function () {

                    linz.app.render(linz.api.views.viewPath('login/form.jade'), locals, done);

                })();

            }


        ], function (err, html) {

            if (err) {
                return next(err);
            }

            // now render the final template, within the layout
            return res.render(linz.api.views.viewPath('adminLogin.jade'), {
                html: html,
                scripts: res.locals.scripts,
                styles: res.locals.styles,
            });

        });

	}

};

module.exports = route;

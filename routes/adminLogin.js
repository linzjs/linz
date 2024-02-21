'use strict';

const async = require('async');
const authenticate = require('../lib/api/middleware/authenticate');

/* GET /admin/login */
module.exports = {
    get: (req, res, next) => {
        const linz = require('../');
        const locals = {
            customAttributes: res.locals.customAttributes,
            hasResetPassword: linz.api.model.get(linz.get('user model'))
                .sendPasswordResetEmail, // check if resetPassword() is defined for user model
            loginError: req.flash('error'), //set login error message
        };

        // pre-render the admin view, ready to plug into the larger wrapper
        async.series(
            [
                function(done) {
                    // render either a custom form, or the default Linz form
                    typeof linz.get('admin login view') === 'function'
                        ? linz
                              .get('admin login view')
                              .call(null, req, locals, done)
                        : (function() {
                              linz.app.render(
                                  linz.api.views.viewPath('login/form.pug'),
                                  locals,
                                  done
                              );
                          })();
                },
            ],
            (err, html) => {
                if (err) {
                    return next(err);
                }

                return Promise.all([
                    linz.api.views.getScripts(req, res),
                    linz.api.views.getStyles(req, res),
                ])
                    .then(([scripts, styles]) => {
                        // Now render the final template, within the layout.
                        return res.render(
                            linz.api.views.viewPath('adminLogin.pug'),
                            {
                                csrfToken: req.csrfToken(),
                                html,
                                scripts,
                                styles,
                            }
                        );
                    })
                    .catch(next);
            }
        );
    },
    post: authenticate('linz-local', { failureFlash: true }),
};

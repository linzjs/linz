'use strict';

const linz = require('../');

module.exports = {

    get: function (req, res, next) {

        Promise.all([
            linz.api.views.getScripts(req, res, [
                {
                    src: `${linz.get('admin path')}/public/js/views/forgotten-password.js`,
                },
            ]),
            linz.api.views.getStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('forgottenPassword.jade'), {
                    csrfToken: req.csrfToken(),
                    scripts,
                    styles,
                });

            })
            .catch(next);

    },

    post: function (req, res, next) {

        Promise.all([
            linz.api.views.getScripts(req, res, [
                {
                    src: `${linz.get('admin path')}/public/js/views/forgotten-password.js`,
                },
            ]),
            linz.api.views.getStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('forgottenPassword.jade'), {
                    csrfToken: req.csrfToken(),
                    email: req.body.email,
                    scripts,
                    styles,
                    success: true,
                });

            })
            .catch(next);

    }

}

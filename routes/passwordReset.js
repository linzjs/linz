'use strict';

const linz = require('../');

module.exports = {

    get: function (req, res, next) {

        Promise.all([
            linz.api.views.getScripts(req, res),
            linz.api.views.getStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('passwordReset.jade'), {
                    csrfToken: req.csrfToken(),
                    record: req.linz.record,
                    scripts,
                    styles,
                });

            })
            .catch(next);

    },

    post: function (req, res, next) {

        Promise.all([
            linz.api.views.getScripts(req, res),
            linz.api.views.getStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('passwordReset.jade'), {
                    csrfToken: req.csrfToken(),
                    scripts,
                    styles,
                    success: true,
                });

            })
            .catch(next);

    }

}

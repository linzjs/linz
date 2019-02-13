'use strict';

const linz = require('../../../');

module.exports = function (err, req, res, next) {

    if (err.code === 'EBADCSRFTOKEN') {
        err.message = (!req.body._csrf || req.body._csrf === 'undefined') ? 'No CSRF token was provided.' : 'The wrong CSRF token was provided.';
    }

    console.error(err.stack);

    Promise.all([
        linz.api.views.getScripts(req, res),
        linz.api.views.getStyles(req, res),
    ])
        .then(([scripts, styles]) => {

            return res.render(linz.api.views.viewPath('error.jade'), {
                error: err,
                returnUrl: req.headers.referer,
                scripts,
                styles,
            });

        })
        .catch(next);

}

'use strict';

const linz = require('../../../');

module.exports = function(err, req, res, next) {
    linz.api.error.store(err, req);

    if (err.code === 'EBADCSRFTOKEN') {
        err.message =
            !req.body._csrf || req.body._csrf === 'undefined'
                ? 'No CSRF token was provided.'
                : 'The wrong CSRF token was provided.';
    }

    console.error(err.stack);

    if (err.json) {
        return res.status(err.statusCode || 500).json({ error: err.message });
    }

    Promise.all([
        linz.api.views.getScripts(req, res),
        linz.api.views.getStyles(req, res),
    ])
        .then(([scripts, styles]) => {
            return res.render(linz.api.views.viewPath('error.pug'), {
                error: err,
                returnUrl: req.headers.referer,
                scripts,
                styles,
            });
        })
        .catch(next);
};

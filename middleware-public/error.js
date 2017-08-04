'use strict';

const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

module.exports = function (err, req, res, next) {

    console.error(err.stack);

    Promise.all([
        setTemplateScripts(req, res),
        setTemplateStyles(req, res),
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

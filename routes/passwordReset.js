'use strict';

const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

module.exports = {

    get: function (req, res, next) {

        Promise.all([
            setTemplateScripts(req, res),
            setTemplateStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('passwordReset.jade'), {
                    record: req.linz.record,
                    scripts,
                    styles,
                });

            })
            .catch(next);

    },

    post: function (req, res, next) {

        Promise.all([
            setTemplateScripts(req, res),
            setTemplateStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('passwordReset.jade'), {
                    scripts,
                    styles,
                    success: true,
                });

            })
            .catch(next);

    }

}

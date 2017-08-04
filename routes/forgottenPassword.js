'use strict';

const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

module.exports = {

    get: function (req, res, next) {

        Promise.all([
            setTemplateScripts(req, res, [
                {
                    src: `${linz.get('admin path')}/public/js/views/forgotten-password.js`,
                },
            ]),
            setTemplateStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('forgottenPassword.jade'), {
                    scripts,
                    styles,
                });

            })
            .catch(next);

    },

    post: function (req, res, next) {

        Promise.all([
            setTemplateScripts(req, res, [
                {
                    src: `${linz.get('admin path')}/public/js/views/forgotten-password.js`,
                },
            ]),
            setTemplateStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('forgottenPassword.jade'), {
                    email: req.body.email,
                    scripts,
                    styles,
                    success: true,
                });

            })
            .catch(next);

    }

}

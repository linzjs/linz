'use strict';

const { parseScriptsAndStyles } = require('./util');

/**
 * Set the scripts for a template.
 * @param {Object} req HTTP response object.
 * @param {Object} res HTTP request object.
 * @param {Array} templateScripts An array of script objects.
 * @return {Promise} Resolves to an array or scripts.
 */
const setTemplateScripts = (req, res, templateScripts) =>
    new Promise((resolve, reject) => {
        const linz = require('../');

        const defaults = [
            {
                src: `${linz.get('admin path')}/public/js/pace.min.js`,
                inHead: true,
            },
            {
                inHead: true,
                ...linz.get('requiredScripts')['jquery.min.js'],
            },
            {
                inHead: true,
                ...linz.get('requiredScripts')['jquery-migrate.min.js'],
            },
            linz.get('requiredScripts')['jquery-ui.min.js'],
            {
                inHead: true,
                ...linz.get('requiredScripts')['bootstrap.min.js'],
            },
            linz.get('requiredScripts')['moment.min.js'],
            linz.get('requiredScripts')['bootstrap-datetimepicker.min.js'],
            {
                src: `${linz.get('admin path')}/public/js/utils.js`,
                inHead: true,
            },
            {
                src: `${linz.get('admin path')}/public/ckeditor/ckeditor.js`,
            },
            {
                src: `${linz.get(
                    'admin path'
                )}/public/js/modernizr.custom.min.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/multiselect.min.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/noty.min.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/template.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/ui.js?v7`,
            },
            {
                src: `${linz.get('admin path')}/public/js/validator.min.js?v1`,
            },
            {
                src: `${linz.get(
                    'admin path'
                )}/public/js/views/model-export.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/tz.js?v1`,
            },
            {
                src: `${linz.get('admin path')}/public/js/offcanvas.min.js`,
            },
            {
                inHead: true,
                src: `${linz.get('admin path')}/public/js/csrf-submit.js?v3`,
            },
        ];

        if (linz.app.locals.adminJSFile) {
            defaults.push({ src: linz.app.locals.adminJSFile });
        }

        res.locals.scripts = []
            .concat(defaults, templateScripts)
            .filter((script) => script !== undefined);

        const customScripts = linz.get('scripts');

        if (!customScripts) {
            return resolve(parseScriptsAndStyles(res.locals.scripts));
        }

        customScripts(req, res)
            .then((result) => resolve(parseScriptsAndStyles(result)))
            .catch(reject);
    });

module.exports = { setTemplateScripts };

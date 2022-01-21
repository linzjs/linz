'use strict';

const { parseScriptsAndStyles } = require('./util');

/**
 * Set the styles for a template.
 * @param {Object} req HTTP response object.
 * @param {Object} res HTTP request object.
 * @param {Array} templateStyles An array of script objects.
 * @return {Promise} Resolves to an array or styles.
 */
const setTemplateStyles = (req, res, templateStyles) =>
    new Promise((resolve, reject) => {
        const linz = require('../');

        const defaults = [
            {
                content:
                    '.pace{-webkit-pointer-events:none;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.pace-inactive{display:none}.pace .pace-progress{background:#29d;position:fixed;z-index:2000;top:0;right:100%;width:100%;height:2px}',
                type: 'text/css',
            },
            {
                href:
                    '//fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,400,300,600,700',
                rel: 'stylesheet',
            },
            {
                rel: 'stylesheet',
                ...linz.get('styleLocations')['bootstrap.min.css'],
            },
            {
                rel: 'stylesheet',
                ...linz.get('styleLocations')['font-awesome.min.css'],
            },
            {
                rel: 'stylesheet',
                ...linz.get('styleLocations')[
                    'bootstrap-datetimepicker.min.css'
                ],
            },
            {
                href: `${linz.get(
                    'admin path'
                )}/public/css/multiselect.min.css`,
                rel: 'stylesheet',
            },
            {
                href: `${linz.get('admin path')}/public/css/noty.css`,
                rel: 'stylesheet',
            },
            {
                href: `${linz.get('admin path')}/public/css/offcanvas.min.css`,
                rel: 'stylesheet',
            },
            {
                href: `${linz.get('admin path')}/public/css/linz.css?v8`,
                rel: 'stylesheet',
            },
        ];

        if (linz.app.locals.adminCSSFile) {
            defaults.push({
                href: linz.app.locals.adminCSSFile,
                rel: 'stylesheet',
            });
        }

        res.locals.styles = []
            .concat(defaults, templateStyles)
            .filter((style) => style !== undefined);

        const customStyles = linz.get('styles');

        if (!customStyles) {
            return resolve(parseScriptsAndStyles(res.locals.styles));
        }

        customStyles(req, res)
            .then((result) => resolve(parseScriptsAndStyles(result)))
            .catch(reject);
    });

module.exports = { setTemplateStyles };

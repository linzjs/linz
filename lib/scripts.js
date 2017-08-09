'use strict';

/**
 * Set the scripts for a template.
 * @param {Object} req HTTP response object.
 * @param {Object} res HTTP request object.
 * @param {Array} templateScripts An array of script objects.
 * @return {Promise} Resolves to an array or scripts.
 */
const setTemplateScripts = (req, res, templateScripts) => new Promise((resolve, reject) => {

    const linz = require('../');

    const defaults = [
        {
            crossorigin: 'anonymous',
            integrity: 'sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=',
            src: '//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js',
        },
        {
            crossorigin: 'anonymous',
            integrity: 'sha256-JklDYODbg0X+8sPiKkcFURb5z7RvlNMIaE3RA2z97vw=',
            src: '//cdnjs.cloudflare.com/ajax/libs/jquery-migrate/3.0.0/jquery-migrate.min.js',
        },
        {
            crossorigin: 'anonymous',
            integrity: 'sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=',
            src: '//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
        },
        {
            crossorigin: 'anonymous',
            integrity: 'sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa',
            src: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',

        },
        {
            crossorigin: 'anonymous',
            integrity: 'sha256-1hjUhpc44NwiNg8OwMu2QzJXhD8kcj+sJA3aCQZoUjg=',
            src: '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js',
        },
        {
            src: `${linz.get('admin path')}/public/js/utils.js`,
        },
        {
            src: `${linz.get('admin path')}/public/ckeditor/ckeditor.js`,
        },
        {
            src: `${linz.get('admin path')}/public/js/modernizr.custom.min.js`,
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
            src: `${linz.get('admin path')}/public/js/ui.js`,
        },
        {
            src: `${linz.get('admin path')}/public/js/validator.min.js`,
        },
    ];

    if (linz.app.locals.adminJSFile) {
        defaults.push({ src: linz.app.locals.adminJSFile });
    }

    res.locals.scripts = [].concat(defaults, templateScripts)
        .filter(script => script !== undefined);

    const customScripts = linz.get('scripts');

    if (!customScripts) {
        return resolve(res.locals.scripts);
    }

    customScripts(req, res)
        .then(resolve)
        .catch(reject);

});

module.exports = setTemplateScripts;

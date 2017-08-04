'use strict';

const linz = require('linz');

/**
 * Set the scripts for a template.
 * @param {Object} req HTTP response object.
 * @param {Object} res HTTP request object.
 * @param {Array} customScripts An array of script objects.
 * @return {Promise} Resolves to an array or scripts.
 */
const setTemplateScripts = (req, res, customScripts) => new Promise((resolve, reject) => {

    res.locals.scripts = res.locals.scripts || [];
    res.locals.scripts = res.locals.scripts.concat([

    ], customScripts);

    linz.get('scripts')(req, res)
        .then((scripts) => {

            if (!scripts || scripts.length) {
                return resolve(res.locals.scripts);
            }

            return resolve(scripts);

        })
        .catch(reject);

});

module.exports = setTemplateScripts;

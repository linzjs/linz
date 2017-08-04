'use strict';

const linz = require('linz');

/**
 * Set the styles for a template.
 * @param {Object} req HTTP response object.
 * @param {Object} res HTTP request object.
 * @param {Array} customStyles An array of script objects.
 * @return {Promise} Resolves to an array or styles.
 */
const setTemplateStyles = (req, res, customStyles) => new Promise((resolve, reject) => {

    res.locals.styles = res.locals.styles || [];
    res.locals.styles = res.locals.styles.concat([

    ], customStyles);

    linz.get('styles')(req, res)
        .then((styles) => {

            if (!styles || styles.length) {
                return resolve(res.locals.styles);
            }

            return resolve(styles);

        })
        .catch(reject);

});

module.exports = setTemplateStyles;

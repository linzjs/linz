'use strict';

const linz = require('../');

/**
 * Determine which styles to load.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP response.
 * @param {Function} next Call the next middleware in the stack.
 * @return {Void} Calls the next middleware in the stack.
 */
const setStyles = (req, res, next) => {

    const setStyles = linz.get('styles');

    setStyles(req)
        .then((arr) => {

            res.locals.styles = res.locals.styles || [];
            res.locals.styles = res.locals.styles.concat(arr);

            return next();

        })
        .catch(next);

};

module.exports = setStyles;

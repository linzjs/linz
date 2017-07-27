'use strict';

const linz = require('../');

/**
 * Determine which scripts to load.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP response.
 * @param {Function} next Call the next middleware in the stack.
 * @return {Void} Calls the next middleware in the stack.
 */
const setScripts = (req, res, next) => {

    const setScripts = linz.get('scripts');

    setScripts(req)
        .then((arr) => {

            res.locals.scripts = res.locals.scripts || [];
            res.locals.scripts = res.locals.scripts.concat(arr);

            return next();

        })
        .catch(next);

};

module.exports = setScripts;

'use strict';

const linz = require('../../../');

/**
 * This middleware provides a hook for those using a custom login process to remain integrated
 * with core Linz functionality (such as redirect to original URL after login).
 * @param {String} strategy The name of the passport strategy to use.
 * @param {Object} opts Configuration options to alter how this function works.
 * @return {Function} Express middleware function.
 */
module.exports = (strategy, opts) => {
    if (!strategy) {
        throw new Error('A passport strategy must be defined.');
    }

    opts = opts || {};

    const successful = opts.successful || linz.api.authentication.successful;
    const failed = opts.failed || linz.api.authentication.failed;

    return (req, res, next) => {
        // call the authenticate method, passing in the strategy, our custom call back and req, res and next
        linz.passport.authenticate(strategy, (err, user, info) => {
            const data = {
                err,
                info,
                next,
                req,
                res,
                user
            };

            return err || !user ? failed(data) : successful(data);
        })(req, res, next);
    };
};

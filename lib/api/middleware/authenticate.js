'use strict';

/**
 * This middleware provides a hook for those using a custom login process to remain integrated
 * with core Linz functionality (such as redirect to original URL after login).
 * @param {String} strategy The name of the passport strategy to use.
 * @param {Object} opts Configuration options to alter how this function works.
 * @return {Function} Express middleware function.
 */
module.exports = (strategy, opts = {}) => {
    if (!strategy) {
        throw new Error('A passport strategy must be defined.');
    }

    const {
        failed,
        failureFlash,
        failureRedirect,
        successFlash,
        successRedirect,
        successful,
    } = opts;

    return (req, res, next) => {
        const linz = require('../../../');
        const successfulFn = successful || linz.api.authentication.successful;
        const failedFn = failed || linz.api.authentication.failed;

        // call the authenticate method, passing in the strategy, our custom call back and req, res and next
        linz.passport.authenticate(strategy, (err, user, info) => {
            const data = {
                err,
                failureFlash,
                failureRedirect,
                info,
                middlewareNext: next,
                next: opts.next,
                req,
                res,
                successFlash,
                successRedirect,
                user,
            };

            return err || !user ? failedFn(data) : successfulFn(data);
        })(req, res, next);
    };
};

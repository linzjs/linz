'use strict';

const linz = require('../');

/**
 * Add custom attributes to the body tag.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Function} next Next function.
 * @return {Void} Adds a classes property to res.locals.
 */
const customAttributes = (req, res, next) => {
    Promise.resolve(linz.get('customAttributes')(req, res))
        .then((customAttributes) => {
            if (req.user) {
                customAttributes.push({
                    name: 'data-linz-user',
                    value: req.user._id.toString(),
                });
            }

            req.locals = req.locals || {};

            // Set both req and res due to the render api.
            req.locals.customAttributes = customAttributes;
            res.locals.customAttributes = customAttributes;

            return next();
        })
        .catch(next);
};

module.exports = customAttributes;

'use strict';

/**
 * Return JSON showing the current user record.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 * @param {Function} next Call the next middleware.
 * @returns {Void} Renders the form.
 */
const whoAmI = (req, res) => res.json(req.user);

module.exports = whoAmI;

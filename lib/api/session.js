'use strict';

/**
 * Get the timezone of the current user.
 * @param {Object} req HTTP request object.
 * @return {String} The timezone of the user in minutes.
 */
const getTimezone = (req) => {
    if (!req || !req.cookies || !req.cookies.linzClientTimezone) {
        return 0;
    }

    return parseInt(req.cookies.linzClientTimezone, 10);
};

module.exports = { getTimezone };

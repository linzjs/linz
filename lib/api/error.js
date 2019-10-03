'use strict';

/**
 * Set a flag to denote this error should be returned via JSON.
 * @param  {Error} err         The error to decorate.
 * @param  {Number} statusCode The statusCode to return.
 * @return {Error}             The decorate error object.
 */
const json = (err, statusCode = 500) => {
    err.json = true;
    err.statusCode = statusCode;

    return err;
};

/**
 * Store an error that has occurred on req.
 * @param  {Object} req A HTTP request object.
 * @param  {Error} err  The error that occurred.
 * @return {Void}
 */
const store = (err, req) => {
    req.linz = req.linz || {};
    req.linz.error = err;

    return req;
};

module.exports = {
    json,
    store,
};

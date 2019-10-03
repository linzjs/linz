'use strict';

const linz = require('linz');

module.exports = (req, res, next) => {
    return next(linz.api.error.json(new Error('Simulated error')));
};

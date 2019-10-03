'use strict';

module.exports = (req, res, next) => {
    return next(new Error('Simulated error'));
};

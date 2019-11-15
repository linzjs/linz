'use strict';

/**
 * Set req.linz.
 * @returns {Void} Calls the next middleware.
 */
const setLinzNamespace = () => (req, res, next) => {

    // Namespace for all things Linz
    req.linz = req.linz || {};
    req.linz.notifications = req.linz.notifications || [];
    req.linz.cache = req.linz.cache || {};
    req.linz.cache.navigation = req.linz.cache.navigation || {};
    req.linz.cache.navigation.invalidate = req.linz.cache.navigation.invalidate || false;

    return next();

};

module.exports = setLinzNamespace;

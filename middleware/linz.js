
var linz = require('../');

// this namespace will by used by Linz
module.exports = function linzNamespace (req, res, next) {

    // namespace for all things Linz
    req.linz = {};
    req.linz.cache = req.linz.cache || {};
    req.linz.cache.navigation = req.linz.cache.navigation || {};
    req.linz.cache.navigation.invalidate = req.linz.cache.navigation.invalidate || false;
    req.linz.cache.permissions = req.linz.cache.permissions || {};
    req.linz.cache.permissions.invalidate = req.linz.cache.permissions.invalidate || false;

    return next();

}

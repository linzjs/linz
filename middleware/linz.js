// this namespace will by used by Linz
module.exports = function linzNamespace (req, res, next) {

    // namespace for all things Linz
    req.linz = req.linz || {};
    req.linz.notifications = req.linz.notifications || [];
    req.linz.cache = req.linz.cache || {};
    req.linz.cache.navigation = req.linz.cache.navigation || {};
    req.linz.cache.navigation.invalidate = req.linz.cache.navigation.invalidate || false;
    req.linz.cache.permissions = req.linz.cache.permissions || {};
    req.linz.cache.permissions.configs = req.linz.cache.permissions.configs || {};
    req.linz.cache.permissions.configs.invalidate = req.linz.cache.permissions.configs.invalidate || false;
    req.linz.cache.permissions.models = req.linz.cache.permissions.models || {};
    req.linz.cache.permissions.models.invalidate = req.linz.cache.permissions.models.invalidate || false;

    return next();

}

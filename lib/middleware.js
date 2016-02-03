var linz = require('../');

// this will mount middleware that needs to exist across all routes, not just admin routes
exports.mountDefaults = function (app) {

    app.use(require('../middleware/request')());

};

// this will mount middleware spefific to the admin router (i.e. only routes beinging with /admin)
exports.mountAdminMiddleware = function (router) {

    router.use(linz.middleware.originalUrl());

};

'use strict';

const linz = require('../');

module.exports = function routesHook (req, res, next) {

    const routes = linz.get('routes');
    const method = req.method.toLowerCase();
    const middleware = routes[method] && routes[method][req.route.path];

    if (!middleware) {
        return next();
    }

    return middleware(req, res, next);

}

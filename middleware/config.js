
var linz = require('../');

// setup the config property for subsequent middleware and routes
module.exports = function (req, res, next) {

    // set the config on the linz namespace
    req.linz.config = linz.api.configs.get(req.params.config);

    return next();

}

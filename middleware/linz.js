
var linz = require('../');

// this namespace will by used by Linz
module.exports = function linzNamespace (req, res, next) {

    // namespace for all things Linz
    req.linz = {};

    return next();

}

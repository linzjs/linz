
var linz = require('../');

// setup the model property for subsequent middleware and routes
module.exports = function (req, res, next) {

    // set the model on the linz namespace
    req.linz.model = linz.api.model.get(req.params.model);

    return next();

}

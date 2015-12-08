
var linz = require('../');

// protect routes by requesting permissions for the action
function permissions (action, type) {

    return function (req, res, next) {

        // TODO: reimplement this
        return next();

    }

};

module.exports = permissions;

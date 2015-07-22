
var linz = require('../'),
    async = require('async');

// provide a permissions object to a view, so that it can lock out certain functionality as required
function viewPermissions (context) {

    return function (req, res, next) {

        // permissions to request
        linz.api.model.getPermissions(req.params.model, req.user, function (err, permissions) {

            console.log(permissions);
            res.locals['permissions'] = permissions;
            return next();
        });

    }

};

module.exports = viewPermissions;

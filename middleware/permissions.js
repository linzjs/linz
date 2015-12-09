
var linz = require('../');

// protect routes by requesting permissions for the action
function permissions (permission, context) {

    return function (req, res, next) {

        // if the context is a model, let's get it
        if (context === 'model') {
            context = {
                model: req.linz.model.modelName,
                type: 'model'
            };
        }

        linz.api.permissions.hasPermission(req.user, context, permission, function (hasPermission) {

            if (hasPermission) {
                return next();
            }

            return res.status(403).render(linz.api.views.viewPath('forbidden.jade'));

        });

    }

};

module.exports = permissions;

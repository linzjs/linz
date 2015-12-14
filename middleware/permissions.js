
var linz = require('../'),
    camelCase = require('camelcase');

// protect routes by requesting permissions for the action
function permissions (permission, context) {

    return function (req, res, next) {

        var perm = permission;

        // if the context is a model, let's get it
        if (context === 'model') {
            context = {
                model: req.linz.model.modelName,
                type: 'model'
            };
        }

        // if we're working with a custom action, let's tweak the permission value
        // send-preview should be canSendPreview, preview should be canPreview
        if (perm === 'action') {
            perm = camelCase('can-' + req.params.action);
        }

        linz.api.permissions.hasPermission(req.user, context, perm, function (hasPermission) {

            // explicitly, a permission must return false in order to be denied
            // an undefined permission, or anything other than false will allow the permission
            // falsy does not apply in this scenario

            if (hasPermission === false) {
                return res.status(403).render(linz.api.views.viewPath('forbidden.jade'));
            }

            return next();

        });

    }

};

module.exports = permissions;

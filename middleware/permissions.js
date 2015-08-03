
var linz = require('../');

// protect routes by requesting permissions for the action
function permissions (action, type) {

    return function (req, res, next) {

        var dataType = type === 'model' ? req.params.model : req.params.config,
            apiType = type === 'config' ? 'configs' : type;

        linz.api[apiType].getPermissions(req, dataType, function (err, permissions) {

            if (err) {
                return next(err);
            }

            if (!permissions[action]) {
                return res.status(403).render(linz.api.views.viewPath('forbidden.jade'));
            }

            res.locals['permissions'] = permissions;

            return next(null);

        });

    }

};

module.exports = permissions;

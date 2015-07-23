
var linz = require('../');

// protect routes by requesting permissions for the action
function permissions (action, type) {

    // skip this extra processing if the permissions function is the default
    if (linz.get('permissions').name === 'defaultPermissions') {

        return function (req, res, next) {
            return next();
        }

    }

    return function (req, res, next) {

        var dataType = type === 'model' ? req.params.model : req.params.config;

        linz.api[type].getPermissions(req, dataType, function (err, permissions) {

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

/**
 * [getContextObj description]
 * @param  {String} type The type of object for which permission is being requested.
 * @param  {Object} req  The Express request object.
 * @return {Object}      An object to be passed to the permissions functionality
 */
function getContextObj (type, req) {

    var context = {
        type: type
    };

    switch (type) {

        case "model":
            context['data'] = req.linz.model;
            break;

        case "config":
            context['data'] = req.linz.config;
            break;

    }

    return context;

}

module.exports = permissions;

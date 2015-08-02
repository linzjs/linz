var linz = require('../../'),
    async = require('async'),
    clone = require('clone');

/**
 * Get linz model by cloning a copy (default) or by reference
 * @param  {String} modelName       Name of model
 * @param  {Boolean} passByReference Specific if result should be a cloned copy or by reference. Default to return a cloned copy
 * @return {Object}                 Model object either by a cloned copy or by reference
 */
function get (modelName, passByReference) {

    if (passByReference) {
        return linz.get('models')[modelName];
    }

    return clone(linz.get('models')[modelName]);
}

/**
 * Get permission data for a model
 * @param {Object}   req      Request data
 * @param {String}   modelName Model name
 * @param {Function} cb        Callback function
 * @return {Object}
 */
function getPermissions(req, modelName, cb) {

    if (!linz.get('disable permission cache') && !req.linz.cache.permissions.models.invalidate && req.session.permissions && req.session.permissions[modelName]) {
        return cb(null, req.session.permissions[modelName]);
    }

    var model = get(modelName, true);

    var permissions = model.linz.formtools.grid.actions.concat(
            model.linz.formtools.grid.recordActions,
            model.linz.formtools.grid.groupActions,
            model.linz.formtools.overview.actions,
            model.linz.formtools.grid.export
        )
        .filter(function (action) {
            return Object.keys(action).indexOf('permission') >= 0;
        })
        .map(function (action) {
            return action.permission;
        })
        .concat(['index','create','overview','edit','delete','json']);

    async.seq(

        function (perms, callback) {

            // setup a permissions object to pass to the view
            async.filter(perms, function (permission, cb) {

                linz.get('permissions')(req.user, permission, {
                    type: 'model',
                    name: modelName
                }, cb);

            }, function (permissions) {

                return callback(null, permissions);

            });

        },

        function (perms, callback) {

            var permissionsObj = {};

            permissions.forEach(function (permission) {
                permissionsObj[permission] = perms.indexOf(permission) >= 0;
            });

            // add canExport flag to indicate one or more export function is allowed
            permissionsObj.canExport = model.linz.formtools.grid.export.some(function (action) {
                return !action.permission || permissionsObj[action.permission];
            });

            // add gridActions flag to indicate one or more grid actions is allowed
            permissionsObj.gridActions = model.linz.formtools.grid.actions.some(function (action) {
                return !action.permission || permissionsObj[action.permission];
            });

            // add recordActions flag to indicate one or more record actions is allowed
            permissionsObj.recordActions = model.linz.formtools.grid.recordActions.some(function (action) {
                return !action.permission || permissionsObj[action.permission];
            });

            // add groupActions flag to indicate one or more group actions is allowed
            permissionsObj.groupActions = model.linz.formtools.grid.groupActions.some(function (action) {
                return !action.permission || permissionsObj[action.permission];
            });

            // add overviewActions flag to indicate one or more overview actions is allowed
            permissionsObj.overviewActions = model.linz.formtools.overview.actions.some(function (action) {
                return !action.permission || permissionsObj[action.permission];
            });

            req.session.permissions = req.session.permissions || {};
            req.session.permissions[modelName] = permissionsObj;

            return callback(null, permissionsObj);

        }

    )(permissions, cb);

}


module.exports = {
    get: get,
    getPermissions: getPermissions
};

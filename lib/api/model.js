var linz = require('../../'),
    async = require('async'),
    clone = require('clone'),
	debugCache = require('debug')('linz:cache');

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
 * Retrieve true/false for a particular model and session
 * @param  {String}   modelName  Name of model
 * @param  {String}   permission Name of permission (i.e. canEdit, canList)
 * @param  {Function} callback   Callback to provide with the true false
 * @return {Void}
 */
function hasPermission (user, modelName, permission, callback) {

    get(modelName, true).getPermissions(user, function (err, permissions) {

        if (err) {
            return callback(false);
        }

        return callback(permissions[permission]);

    });

}

/**
 * Retrieve the form DSL for a model
 * @param  {Object}   user      The user to which the form should be customised
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the form DSL to
 * @return {Void}
 */
function form (user, modelName, callback) {
    return get(modelName, true).getForm(user, callback);
}

/**
 * Retrieve the grid DSL for a model
 * @param  {Object}   user      The user to which the grid should be customised
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the grid DSL to
 * @return {Void}
 */
function grid (user, modelName, callback) {
    return get(modelName, true).getGrid(user, callback);
}

/**
 * Retrieve the permissions DSL for a model
 * @param  {Object}   user      The user to which the permissions should be customised
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the permissions DSL to
 * @return {Void}
 */
function permissions (user, modelName, callback) {
    return get(modelName, true).getPermissions(user, callback);
}

/**
 * Retrieve the overview DSL for a model
 * @param  {Object}   user      The user to which the overview DSL should be customised
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the overview DSL to
 * @return {Void}
 */
function overview (user, modelName, callback) {
    return get(modelName, true).getOverview(user, callback);
}

module.exports = {
    get: get,
    hasPermission: hasPermission,
    form: form,
    grid: grid,
    permissions: permissions,
    overview: overview
};

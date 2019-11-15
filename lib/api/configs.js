var linz = require('../../'),
    clone = require('clone'),
	debugCache = require('debug')('linz:cache');

/**
 * Get linz config by reference or by cloning a copy
 * @param  {String} configName      Name of config
 * @param  {Boolean} copy           Specify if result should be a cloned copy or by reference. Default to return a reference.
 * @return {Object}                 Config object either by a cloned copy or by reference
 */
function get (configName, copy) {

    if (copy) {
        return clone(linz.get('configs')[configName]);
    }

    return linz.get('configs')[configName];
}

/**
 * Retrieve true/false for a particular config and session
 * @param  {String}   configName  Name of config
 * @param  {String}   permission  Name of permission (i.e. canEdit, canList)
 * @param  {Function} callback    Callback to provide with the true false
 * @return {Void}
 */
function hasPermission (user, configName, permission, callback) {

    get(configName).schema.statics.getPermissions(user, function (err, permissions) {

        if (err) {
            return callback(false);
        }

        return callback(permissions[permission]);

    });

}

/**
 * Retrieve the permissions DSL for a config
 * @param  {Object}   user      The user to which the permissions DSL should be customised
 * @param  {String}   configName The name of the config
 * @param  {Function} callback  A callback to return the permissions DSL to
 * @return {Void}
 */
function permissions (user, configName, callback) {
    return get(configName).schema.statics.getPermissions(user, callback);
}

/**
 * Retrieve the form DSL for a config
 * @param  {Object}   req      A HTTP request object which should be used to customise the DSL
 * @param  {String}   configName The name of the config
 * @param  {Function} callback  A callback to return the form DSL to
 * @return {Void}
 */
function form (req, configName, callback) {
    return get(configName).schema.statics.getForm(req, callback);
}

/**
 * Retrieve the overview DSL for a config
 * @param  {Object}   req      A HTTP request object which can be used to customise the DSL
 * @param  {String}   configName The name of the config
 * @param  {Function} callback  A callback to return the overview DSL to
 * @return {Void}
 */
function overview (req, configName, callback) {
    return get(configName).schema.statics.getOverview(req, callback);
}

/**
 * Retrieve the labels for a config
 * @param  {String}   configName The name of the config
 * @param  {Function} callback  An optional callback to return the labels object to
 * @return {Void}
 */
function labels (configName, callback) {

    if (callback) {
        return get(configName).schema.statics.getLabels(callback);
    }

    return get(configName).schema.statics.getLabels();
}

module.exports = {
    get: get,
    hasPermission: hasPermission,
    permissions: permissions,
    form: form,
    overview: overview,
    labels: labels
};

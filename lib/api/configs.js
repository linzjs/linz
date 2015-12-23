var linz = require('../../'),
    async = require('async'),
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
 * @param  {String}   configName  Name of model
 * @param  {String}   permission Name of permission (i.e. canEdit, canList)
 * @param  {Function} callback   Callback to provide with the true false
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

module.exports = {
    get: get,
    hasPermission: hasPermission
};

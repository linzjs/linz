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
function permission (user, modelName, permission, callback) {

    get(modelName, true).getPermissions(user, function (err, permissions) {

        if (err) {
            return cb(false);
        }

        return callback(permissions[permission]);

    });

}


module.exports = {
    get: get,
    permission: permission
};

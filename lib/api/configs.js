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
 * Get config permissions
 * @param {Object}   req      Request data
 * @param {String}   configName Config name
 * @param {Function} cb        Callback function
 * @return {Object}
 */
function getPermissions(req, configName, cb) {

    if (!linz.get('disable config cache') && !req.linz.cache.permissions.configs.invalidate && req.session.configs && req.session.configs[configName]) {
        return cb(null, req.session.configs[configName]);
    }

    debugCache('Priming config (%s) cache', configName);

    var permissions = ['index','overview','edit','reset','json'];

    async.seq(

        function (perms, callback) {

            // setup a permissions object to pass to the view
            async.filter(perms, function (permission, cb) {

                linz.get('permissions')(req.user, permission, {
                    type: 'config',
                    name: configName
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

            req.session.configs = req.session.configs || {};
            req.session.configs[configName] = permissionsObj;

            return callback(null, permissionsObj);

        }

    )(permissions, cb);

}

module.exports = {
    get: get,
    getPermissions: getPermissions
};

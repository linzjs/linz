var linz = require('../../'),
	debugCache = require('debug')('linz:permissions');

/**
 * Determine if a user has access to a route, model or config
 * @param  {object}          user        The user object in which the context of the permission should be based.
 * @param  {String|object}   context     The context for the permission. One of 'models', 'configs', {type:'model', model:{object}} or {type:'config': config:{config}}
 * @param  {string}          permission  The permission being requested.
 * @param  {Function}        cb          The callback with the result. Accepts true or false only.
 */
function hasPermission (user, context, permission, cb) {

    /**
     * Support three types of permissions:
     * - navigation
     * - models and model
     * - configs and config
     *
     * Context can either be an object, or a string. If context is a string, no other data need be passed through.
     * If context is an object, it must have a type and a related property. Linz supports the following:
     * - 'models'
     * - 'configs'
     * - {type: 'model', model: {string}}
     */

	if (typeof context === 'string') {
		context = {
			type: context
		};
	}

	if (context.type.toLowerCase() === 'models' || context.type.toLowerCase() === 'configs') {
		return linz.get('permissions')(user, context.type, permission, cb);
	}

	if (context.type.toLowerCase() === 'model') {
		return linz.api.model.permission(user, context.model, permission, cb);
	}

}

module.exports = {
    hasPermission: hasPermission
};

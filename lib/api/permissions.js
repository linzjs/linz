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

	var _context = context;

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
     * - {type: 'config', config: {string}}
     */

	if (typeof context === 'string') {
		_context = {
			type: context
		};
	}

	if (_context.type.toLowerCase() === 'models' || _context.type.toLowerCase() === 'configs') {
		return linz.get('permissions')(user, _context.type, permission, cb);
	}

	if (_context.type.toLowerCase() === 'model') {
		return linz.api.model.hasPermission(user, _context.model, permission, cb);
	}

	if (_context.type.toLowerCase() === 'config') {
		return linz.api.configs.hasPermission(user, _context.config, permission, cb);
	}

}

module.exports = {
    hasPermission: hasPermission
};

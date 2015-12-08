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


module.exports = {
    get: get
};

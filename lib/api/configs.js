var linz = require('../../');

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

module.exports = {
    get: get
};

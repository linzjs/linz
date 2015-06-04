var linz = require('../../');

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
 * Get data for provided model name by the model id
 * @param  {String} modelName       Name of model
 * @param  {Boolean} passByReference Specific if result should be a cloned copy or by reference. Default to return a cloned copy
 * @return {Object} or undefined
 */
function getData (modelName, id, cb) {

    var model = get(modelName, true);

    if (!model.getData) {
        return model.findById(id, cb);
    }

    return model.getData(id, cb);

}

module.exports = {
    get: get,
    getData: getData
};

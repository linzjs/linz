var linz = require('../../'),
    async = require('async'),
    clone = require('clone'),
	debugCache = require('debug')('linz:cache'),
    utils = require('../utils');

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
 * Retrieve the list DSL for a model
 * @param  {Object}   user      The user to which the list should be customised
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the list DSL to
 * @return {Void}
 */
function list (user, modelName, callback) {
    return get(modelName, true).getList(user, callback);
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

/**
 * Retrieve the labels for a model
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  An optional callback to return the labels object to
 * @return {Void}
 */
function labels (modelName, callback) {

    if (callback) {
        return get(modelName, true).getLabels(callback);
    }

    return get(modelName, true).getLabels();
}

/**
 * Get the ObjectId from the two types of reference fields that Linz supports:
 *
 * bdm: {
 *     type: linz.mongoose.Schema.Types.ObjectId,
 *     ref: 'mmsUser'
 * },
 * createdBy: {
 *     type: linz.mongoose.Schema.Types.Mixed,
 *     ref: 'mmsUser'
 * }
 *
 * If can ObjectId can't be found, simply return the original value;
 *
 * @param  {Object} val Either an instance of ObjectId or { type: 'modelName', _id: ObjectID() }
 * @return {Object}     Return either an ObjectID or the original value.
 */
function getObjectIdFromRefField (val) {

    let oid = linz.mongoose.Types.ObjectId;

    // Determine if we have an ObjectId or an Object with an ObjectId in it.
    // { type: 'modelName': _id: ObjectID() }
    // If `val` exists, `val` itself is not an instance of ObjectId,
    // `val._id` exists, and `val._id` is an instance of ObjectId.
    if (val && !(val instanceof oid) && val._id && val._id instanceof oid) {
        return val._id;
    }

    return val;

}

/**
 * Get the search filters for a search on a model.
 * @param {String} modelName The name of the model.
 * @param {String} content The content to search for.
 * @param {Object} options The search options.
 * @param {Array} options.fields The fields to search for.
 * @return {Object} A filters object.
 */
const getSearchFilters = (modelName, content, options) => new Promise((resolve, reject) => {

    const Model = linz.get('models')[modelName];
    const settings = Object.assign({ fields: ['title'] }, options);

    if (!Model || !Model.schema || !Model.schema.paths) {

        const validFields = Object.keys(Model.schema.paths);

        settings.fields.forEach((field) => {

            if (!validFields.includes(field)) {
                return reject(new Error(`${field} not found in ${modelName}`));
            }

        });

    }

    const filters = [];
    const { ObjectId } = linz.mongoose.Types;

    settings.fields.forEach((field) => {

        let value = content;
        const fieldType = Model.schema.paths[field] && Model.schema.paths[field].instance;

        if (fieldType === 'Boolean') {
            value = utils.asBoolean(value);
        }

        if (fieldType === 'Number') {
            value = utils.parseString(value, { parseNumber: true });
        }

        // Don't both searching if the ObjectId is invalid.
        if (fieldType === 'ObjectID' && !ObjectId.isValid(value)) {
            return filters;
        }

        if (fieldType === 'String') {

            let searchString = value.trim();

            // Escape characters */\()?.$^[]+-=|{}:`'&!
            searchString = searchString.replace(/([*\/\\\(\)\?\.\$\^\[\]\+\-\=\|\{\}\:\`\'\&\!])/g, '\\$1');

            // Replace one or more spaces between search keywords with an OR operation for multiple match searches.
            searchString = searchString.replace(/\s+/g, '|');

            return filters.push({ [field]: { $regex: new RegExp(searchString, 'ig') } });

        }

        return filters.push({ [field]: value });

    });

    return resolve({ $or: filters });

});

module.exports = {
    form,
    get,
    getObjectIdFromRefField,
    getSearchFilters,
    hasPermission,
    labels,
    list,
    overview,
    permissions,
};

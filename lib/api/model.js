'use strict';

const linz = require('../../');
const clone = require('clone');
const pluginHelpers = require('../formtools/plugins/plugins-helpers');
const sentenceCase = require('sentence-case');

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
 * @param  {Object}   req       A HTTP request object which can be used to customised the form
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the form DSL to
 * @return {Void}
 */
function form (req, modelName, callback) {
    return get(modelName, true).getForm(req, callback);
}

/**
 * Retrieve the list DSL for a model
 * @param  {Object}   req       A HTTP request object which can be used to customised the list
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the list DSL to
 * @return {Void}
 */
function list (req, modelName, callback) {
    return get(modelName, true).getList(req, callback);
}

/**
 * Retrieve the model DSL for a model
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the form DSL to
 * @return {Void}
 */
function model (modelName, callback) {
    return get(modelName, true).getModelOptions(callback);
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
 * @param  {Object}   req       A HTTP request object which can be used to customised the overview
 * @param  {String}   modelName The name of the model
 * @param  {Function} callback  A callback to return the overview DSL to
 * @return {Void}
 */
function overview (req, modelName, callback) {
    return get(modelName, true).getOverview(req, callback);
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
 * Retrieve the title field for a model
 * @param  {String}   modelName The name of the model.
 * @param  {String}   field     A field in the model.
 * @param  {Function} callback  A callback to provide the result to.
 * @return {Void}
 */
function titleField (modelName, field, callback) {

    // Make this a no-op unless the field being evaluated is `'title'`.
    if (field !== 'title') {
        return callback(null, field);
    }

    if (get(modelName, true).schema.paths[field]) {
        return callback(null, field);
    }

    model(modelName, (err, opts) => {

        if (err) {
            return callback(err);
        }

        return callback(null, opts.title);

    });

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
 * Generate a Linz model form. (Use generateFormString() to get the html only)
 * @param {String} model The model.
 * @param {Object} [options={}] The options object.
 * @param {Object} [options.record={}] The record.
 * @param {Object} options.req Pass a req object that can customise the form.
 * @param {String} [options.type='create'] The form type.
 * @return {String} Returns the form HTML.
 */
const generateForm = (model, options = {}) => new Promise((resolve, reject) => {

    const {
        form: formOption,
        record = {},
        req = {},
        type = 'create',
    } = options;

    Object.keys(formOption).forEach((option) => {

        if (!formOption[option].label) {
            formOption[option].label = sentenceCase(option);
        }

    });

    form(req, model.modelName, (error, foundForm) => {

        if (error) {
            return reject(error);
        }

        labels(model.modelName, (labelErr, formLabels) => {

            if (labelErr) {
                return reject(labelErr);
            }

            const formDsl = formOption ? pluginHelpers.formSettings(model.schema, formOption, formLabels) : foundForm;

            linz.formtools.form.generateFormFromModel(model.schema, formDsl, record, type, (err, formObj) => {

                if (err) {
                    return reject(err);
                }

                return resolve(formObj);

            });

        });

    });

});

/**
 * Generate a Linz model form HTML string.
 * @param {String} model The model.
 * @param {Object} [options={}] The options object.
 * @param {String} [options.actionUrl='#'] The form post action.
 * @param {String} [options.cancelUrl='/'] The form post action.
 * @param {String} options.record The record.
 * @param {String} [options.type='create'] The form type.
 * @return {String} Returns the form HTML.
 */
const generateFormString = (model, options = {}) => new Promise((resolve, reject) => {

    const {
        actionUrl = '#',
        cancelUrl = '/',
    } = options;

    generateForm(model, options)
        .then(form => linz.api.views.renderPartial('form', {
            actionUrl,
            cancelUrl,
            form: form.render(),
        }, (err, html) => {

            if (err) {
                return reject(err);
            }

            return resolve(html);

        }))
        .catch(reject);

});

module.exports = {
    form: form,
    generateForm,
    generateFormString,
    get: get,
    getObjectIdFromRefField: getObjectIdFromRefField,
    hasPermission: hasPermission,
    labels: labels,
    list: list,
    model: model,
    overview: overview,
    permissions: permissions,
    titleField: titleField
};

var cellRenderers = require('./'),
    utils = require('../../../utils');

module.exports = function defaultRenderer(val, record, fieldName, model, callback) {

    if (val === undefined) {
        return callback(null);
    }

    if (Array.isArray(val)) {

        if (!val.length) {
            return callback(null);
        }

        // check if this field is a document array
        if (Array.isArray(model.schema.tree[fieldName])) {
            return cellRenderers.documentArray(val, record, fieldName, model, callback);
        }

        return cellRenderers.array(val, record, fieldName, model, callback);
    }

    if (val instanceof Date) {
        return cellRenderers.date(val, record, fieldName, model, callback);
    }

    if (val !== '' && utils.isBoolean(val)) {
        return cellRenderers.boolean(val, record, fieldName, model, callback);
    }

    // check if field is a reference document
    if (model.schema.tree[fieldName] && model.schema.tree[fieldName].ref) {

        return cellRenderers.referenceName(val, record, fieldName, model, callback);

    }

    return callback(null, val);

};

'use strict';

const linz = require('../../../');

const referenceValue = function referenceValueRenderer (val, record, fieldName, model, callback) {

    const refModel = linz.mongoose.models[model.schema.tree[fieldName].ref];

    // Userland hook to allow a custom method to retrieve the data
    if (refModel.findForReference) {
        return refModel.findForReference(val, callback);
    }

    linz.api.renderers.referenceRenderer(val, { model: refModel })
        .then(result => callback(null, result))
        .catch(callback);

};

module.exports = referenceValue;

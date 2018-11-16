'use strict';

const linz = require('linz');

/**
 * Render a reference field as a string.
 * @param {Object} val The field value, this should be an ObjectId.
 * @param {Object} opts The options object.
 * @param {String} [opts.default=''] An optional default string to return.
 * @param {Object} opts.model A mongoose model object.
 * @return {Promise} Resolves with the string to display.
 */
const referenceRenderer = (val, opts) => new Promise((resolve, reject) => {

    const options = Object.assign({ default: '' }, opts);

    if (!val && options.default) {
        return resolve(options.default);
    }

    if (!options.model) {
        return reject(new Error('No model was provided'));
    }

    const Model = linz.api.model.get(options.model);

    if (Array.isArray(val)) {

        return Model.find({ _id: { $in: val } })
            .then(docs => resolve(docs.map(doc => doc.title)))
            .catch(reject);

    }

    return Model.findOne(val)
        .then(doc => resolve(doc.title))
        .catch(reject);

});

module.exports = referenceRenderer;

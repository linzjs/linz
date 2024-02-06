'use strict';

const linz = require('../../../');

const reference = async (val, record, fieldName, model, callback) => {
    const refModel = linz.mongoose.models[model.schema.tree[fieldName].ref];

    const generateLink = (doc) =>
        `<a href="${linz.api.url.getAdminLink(
            refModel,
            'overview',
            doc._id.toString()
        )}" title="${linz.api.util.escape(doc.title)}">${linz.api.util.escape(
            doc.title
        )}</a>`;

    // Userland hook to allow a custom method to retrieve the data
    if (refModel.findForReference) {
        try {
            const ref = await refModel.findForReference(val);

            return callback(null, ref);
        } catch (err) {
            return callback(err);
        }
    }

    // `val` and `record` could be arrays...
    if (Array.isArray(val)) {
        return refModel
            .find({ _id: { $in: val } })
            .exec()
            .then((docs) => {
                // Return an object, indexed by `_id`.
                // There is no guarantee the results will be returned in the same order
                // as the array so this will avoid that scenario.

                let results = {};

                docs.forEach(
                    (doc) => (results[doc._id.toString()] = generateLink(doc))
                );

                return callback(null, results);
            })
            .catch(callback);
    }

    // Not an array, just a single value.
    return refModel
        .findById(val)
        .exec()
        .then((doc) => callback(null, generateLink(doc)))
        .catch(callback);
};

module.exports = reference;

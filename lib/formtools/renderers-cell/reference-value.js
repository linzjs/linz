'use strict';

const linz = require('../../../');

const referenceValue = async function referenceValueRenderer(
    val,
    record,
    fieldName,
    model,
    callback
) {
    if (!linz.mongoose.isValidObjectId(val._id)) {
        return callback(null, linz.api.util.escape(val));
    }

    if (linz.mongoose.models[val.ref].findForReference) {
        try {
            const ref = await linz.mongoose.models[val.ref].findForReference(
                val._id
            );

            return callback(null, ref);
        } catch (err) {
            return callback(err);
        }
    }

    linz.mongoose.models[val.ref]
        .findById(val._id)
        .exec()
        .then((doc) =>
            doc
                ? linz.api.util.escape(doc.title)
                : val && val.length
                ? linz.api.util.escape(val) + ' (missing)'
                : ''
        )
        .catch((err) => callback(err));
};

module.exports = referenceValue;

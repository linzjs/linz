'use strict';

const linz = require('../../../');

const referenceName = function referenceNameRenderer(
    val,
    record,
    fieldName,
    model,
    callback
) {
    if (!linz.mongoose.isValidObjectId(val)) {
        return callback(null, linz.api.util.escape(val));
    }

    linz.mongoose.models[model.schema.tree[fieldName].ref]
        .findById(val)
        .exec()
        .then((doc) =>
            callback(
                null,
                doc
                    ? linz.api.util.escape(doc.title)
                    : val && val.length
                    ? linz.api.util.escape(val) + ' (missing)'
                    : ''
            )
        )
        .catch((err) => callback(err));
};

module.exports = referenceName;

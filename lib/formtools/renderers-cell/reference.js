'use strict';

const linz = require('../../../');

const reference = function referenceRenderer (val, record, fieldName, model, callback) {

    // Userland hook to allow a custom method to retrieve the data
    if (linz.mongoose.models[model.schema.tree[fieldName].ref].findForReference) {
        return linz.mongoose.models[model.schema.tree[fieldName].ref].findForReference(val, callback);
    }

    // `val` and `record` could be arrays...
    if (Array.isArray(val)) {

        return linz.mongoose.models[model.schema.tree[fieldName].ref].findDocuments({
            filter: { _id: { $in: val } },
            projection: 'title',
        }).exec((err, docs) => {

            // Return an object, indexed by `_id`.
            // There is no guarantee the results will be returned in the same order
            // as the array so this will avoid that scenario.

            let results = {};

            for (let doc of docs) {
                results[doc._id.toString()] = doc.title;
            }

            callback(err, results);

        });

    }

    // Not an array, just a single value.
    linz.mongoose.models[model.schema.tree[fieldName].ref].findOneDocument({
        filter: { _id: val },
        projection: 'title',
    }).exec(function (err, doc) {

        return callback(err, (doc) ? doc.title : ((val && val.length) ? val + ' (missing)' : ''));

    });

};

module.exports = reference;

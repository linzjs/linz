'use strict';

const linz = require('../../../');

const referenceValue = function referenceValueRenderer (val, record, fieldName, model, callback) {

    if (linz.mongoose.models[val.ref].findForReference) {

        return linz.mongoose.models[val.ref].findForReference(val._id, callback);

    }

    linz.mongoose.models[val.ref].findOneDocument({
        filter: { _id: val._id },
        projection: 'title',
    })
        .exec(function (err, doc) {

            if (err) {
                return callback(err);
            }

            return callback(null, (doc) ? doc.title : ((val && val.length) ? val + ' (missing)' : ''));

        });

};

module.exports = referenceValue;

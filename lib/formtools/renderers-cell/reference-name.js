'use strict';

const linz = require('../../../');

const referenceName = function referenceNameRenderer (val, record, fieldName, model, callback) {

    linz.mongoose.models[model.schema.tree[fieldName].ref].findOneDocument({
        filter: { _id: val },
        projection: 'title',
    })
        .exec(function (err, doc) {

            if (err) {
                return callback(err);
            }

            return callback(null, (doc) ? doc.title : ((val && val.length) ? val + ' (missing)' : ''));

        });

};

module.exports = referenceName;

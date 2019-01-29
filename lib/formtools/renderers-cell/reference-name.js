'use strict';

const linz = require('../../../');

const referenceName = function referenceNameRenderer (val, record, fieldName, model, callback) {

    linz.mongoose.models[model.schema.tree[fieldName].ref].findById(val, function (err, doc) {

        return callback(null, (doc) ? doc.title : ((val && val.length) ? val + ' (missing)' : ''));

    });

};

module.exports = referenceName;

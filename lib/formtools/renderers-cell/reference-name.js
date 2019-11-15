'use strict';

const linz = require('../../../');

const referenceName = function referenceNameRenderer (val, record, fieldName, model, callback) {

    linz.mongoose.models[model.schema.tree[fieldName].ref].findById(val, function (err, doc) {

        return callback(null, (doc) ? linz.api.util.escape(doc.title) : ((val && val.length) ? linz.api.util.escape(val) + ' (missing)' : ''));

    });

};

module.exports = referenceName;

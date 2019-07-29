'use strict';

const linz = require('../../../');

const referenceValue = function referenceValueRenderer (val, record, fieldName, model, callback) {

    if (linz.mongoose.models[val.ref].findForReference) {

        return linz.mongoose.models[val.ref].findForReference(val._id, callback);

    }

    linz.mongoose.models[val.ref].findById(val._id, function (err, doc) {

        return callback(null, (doc) ? linz.api.util.escape(doc.title) : ((val && val.length) ? linz.api.util.escape(val) + ' (missing)' : ''));

    });

};

module.exports = referenceValue;

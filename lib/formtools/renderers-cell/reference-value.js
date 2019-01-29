'use strict';

const linz = require('../../../');

const referenceValue = function referenceValueRenderer (val, record, fieldName, model, callback) {

    if (linz.mongoose.models[val.ref].findForReference) {

        return linz.mongoose.models[val.ref].findForReference(val._id, callback);

    }

    linz.mongoose.models[val.ref].findById(val._id, function (err, doc) {

        return callback(null, (doc) ? doc.title : ((val && val.length) ? val + ' (missing)' : ''));

    });

};

module.exports = referenceValue;

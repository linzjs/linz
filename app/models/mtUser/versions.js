var linz = require('linz');

const referenceName = (val, record, fieldName, model, callback) => {

    if (!linz.mongoose.Types.ObjectId.isValid(val)) {
        return callback(null, linz.api.util.escape(val));
    }

    return linz.formtools.cellRenderers.referenceName(val, record, fieldName, model, callback);

}

const reference = (val, record, fieldName, model, callback) => {

    if (!linz.mongoose.Types.ObjectId.isValid(val)) {
        return callback(null, linz.api.util.escape(val));
    }

    return linz.formtools.cellRenderers.reference(val, record, fieldName, model, callback);

};

module.exports = {
    collection: 'mtusers_versions',
    logError: true,
    ignorePaths: ['dateModified', 'objectField'],
    settings: {
        cellRenderers: {
            reference,
            referenceName,
            date: linz.formtools.cellRenderers.localDateTime
        },
        compare: {
            exclusions: {
                'createdBy': 0,
                'dateCreated': 0,
                'dateModified': 0,
                'modifiedBy': 0,
                'objectField': 0
            }
        }
    }
};

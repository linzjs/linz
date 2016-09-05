var linz = require('../'),
    async = require('async');

module.exports = function (req) {

    var Model = req.linz.model,
        fieldExclusions = {
            '_id': 0,
            '__v': 0,
            'refId': 0,
            'refVersion': 0
        };

    // add compare exclusion fields from model configs
    if (Model.versions.compare && Model.versions.compare.exclusions) {

        var exclusions = Model.versions.compare.exclusions || {
            'dateModified': 0,
            'dateCreated': 0
        };

        // add in additional exclusion fields to fieldExclusions
        Object.keys(exclusions).forEach(fieldName => fieldExclusions[fieldName] = exclusions[fieldName]);

    }

    var getAuthor = (record, cb) => {

        Model.versions.cellRenderers.referenceName(record.modifiedBy, record, 'modifiedBy', Model, function (err, result) {

            if (err) {
                return cb(err);
            }

            record.author = result;

            return cb(null, record);

        });

    }

    var getDate = (record, cb) => {

        Model.versions.cellRenderers.date(record.dateCreated, record, 'dateCreated', Model, function (err, result) {

            if (err) {
                return cb(err);
            }

            record.date = result;

            return cb(null, record);

        });

    }

    var getReferenceNames = (record, cb) => {

        async.each(Object.keys(record), (fieldName, getReferenceDone) => {

            linz.versions.renderers.cellRenderers.default(record[fieldName], record, fieldName, Model, (err, str) => {
                if (err) {
                    return getReferenceDone(err);
                }
                record[fieldName] = str;
                return getReferenceDone(null);
            });

        }, err => {
            return cb(err, record);
        });

    }

    var getFieldNames = record => {

        var recordWithFieldNames = {},
            form = req.linz.model.linz.formtools.form;

        Object.keys(record).forEach(fieldName => {
            if (!form[fieldName]) {
                return;
            }
            recordWithFieldNames[form[fieldName].label] = record[fieldName];
        });

        return recordWithFieldNames;

    }

    var getVersionById = (id, projection, bRenderFields, cb) => {

        Model.VersionedModel.findById(id, projection, { lean: 1 }, (err, record) => {

            if (err) {
                return cb(err);
            }

            if (!record) {
                return cb (new Error('Error: Record not found.'));
            }

            if (!bRenderFields) {
                return cb(null, record);
            }

            getReferenceNames(record, (err, record) => cb(null, getFieldNames(record)));

        });

    }

    return {

        getLastest: cb => getVersionById(req.params.revisionBId, fieldExclusions, false, cb),

        getPrevious: cb => getVersionById(req.params.revisionAId, fieldExclusions, false, cb),

        getLatestVersionAdditionalProps: cb => {

            async.waterfall([
                getValueDone => getVersionById(req.params.revisionBId, undefined, false, getValueDone),
                getAuthor,
                getDate
            ], cb);

        },

        getPreviousVersionAdditionalProps: cb => {

            async.waterfall([
                getValueDone => getVersionById(req.params.revisionAId, undefined, false, getValueDone),
                getAuthor,
                getDate
            ], cb);

        },

        getVersionById: getVersionById

    }

}

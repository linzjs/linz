module.exports = function (req, res, next) {

    var Model = req.linz.api.model.get(req.params.model),
        fieldExclusions = {
            '_id': 0,
            '__v': 0,
            'refId': 0,
            'refVersion': 0
        },
        fieldInclusions = { dateModified: 1, modifiedBy: 1};

    // add compare exclusion fields from model configs
    if (Model.versions.compare && Model.versions.compare.exclusions) {

        var exclusions = Model.versions.compare.exclusions || {
            'dateModified': 0,
            'dateCreated': 0
        };

        Object.keys(exclusions).forEach(function (fieldName) {
            fieldExclusions[fieldName] = exclusions[fieldName];
        });
    }

    var getAuthor = function (record, cb) {

        Model.versions.cellRenderers.referenceName(record.modifiedBy, record, 'modifiedBy', Model, function (err, result) {

            if (err) {
                return cb(err);
            }

            record.author = result;

            return cb(null, record);

        });

    }

    var getDate = function (record, cb) {

        Model.versions.cellRenderers.date(record.dateModified, record, 'dateModified', Model, function (err, result) {

            if (err) {
                return cb(err);
            }

            record.date = result;

            return cb(null, record);

        });

    }

    var getVersionById = function (id, exclusions, cb) {

        Model.VersionedModel.findById(id, exclusions, { lean: 1 }, function (err, record) {

            if (err) {
                return cb(err);
            }

            if (!record) {
                return cb (new Error('Error: Record not found.'));
            }

            getReferenceNames(record, function (err, record) {
                var recordWithLabel = getFieldNames(record);
                return cb(null, recordWithLabel);
            });

        });

    }

    var getReferenceNames = function (record, cb) {

        async.each(Object.keys(record), function (fieldName, getReferenceDone) {

            linz.versions.renderers.cellRenderers.default(record[fieldName], record, fieldName, Model, function (err, str) {
                if (err) {
                    return getReferenceDone(err);
                }
                record[fieldName] = str;
                return getReferenceDone(null);
            });

        }, function (err) {
            return cb(err, record);
        });

    }

    var getFieldNames = function (record) {

        var recordWithFieldNames = {},
            form = Model.linz.formtools.form;

        Object.keys(record).forEach(function (fieldName) {
            if (!form[fieldName]) {
                return;
            }
            recordWithFieldNames[form[fieldName].label] = record[fieldName];
        });

        return recordWithFieldNames;

    }

    return {

        getLastest: function (cb) {

            getVersionById(req.params.revisionBId, fieldExclusions, cb);

        },

        getPrevious: function (cb) {

            getVersionById(req.params.revisionAId, fieldExclusions, cb);

        },

        getLatestVersionAdditionalProps: function (cb) {

            async.waterfall([

                function (getValueDone) {
                    getVersionById(req.params.revisionBId, fieldInclusions, getValueDone);
                },
                getAuthor,
                getDate

            ], cb);

        },

        getPreviousVersionAdditionalProps: function (cb) {

            async.waterfall([

                function (getValueDone) {
                    getVersionById(req.params.revisionAId, fieldInclusions, getValueDone);
                },
                getAuthor,
                getDate

            ], cb);

        }

    }

}

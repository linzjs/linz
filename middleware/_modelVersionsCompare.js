module.exports = function (req, res, next) {

    var Model = req.linz.get('models')[req.params.model],
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

            return cb(null, record);

        });

    }

    return {

        getLastest: function (cb) {

            getVersionById(req.params.revisionBId, fieldExclusions, function (err, record) {
                return cb(err, record);
            });

        },

        getPrevious: function (cb) {

            getVersionById(req.params.revisionAId, fieldExclusions, function (err, record) {
                return cb(err, record);
            });

        },

        getLatestVersionAdditionalProps: function (cb) {

            async.waterfall([

                function (getValueDone) {

                    getVersionById(req.params.revisionBId, fieldInclusions, function (err, record) {
                        return getValueDone(err, record);
                    });

                },

                getAuthor,

                getDate

            ], function (err, result) {
                return cb(err, result);
            });

        },

        getPreviousVersionAdditionalProps: function (cb) {

            async.waterfall([

                function (getValueDone) {

                    getVersionById(req.params.revisionAId, fieldInclusions, function (err, record) {
                        return getValueDone(err, record);
                    });

                },

                getAuthor,

                getDate

            ], function (err, result) {
                return cb(err, result);
            });

        }

    }

}

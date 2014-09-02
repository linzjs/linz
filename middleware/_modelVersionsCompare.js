module.exports = function (req, res, next) {

    var Model = req.linz.get('models')[req.params.model],
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

    return {

        getLastest: function (cb) {

            var query;

            if (req.params.revisionBId === 'latest') {
                query = Model.find({_id: req.params.id }, fieldExclusions, { lean: 1 });
            } else {
                query = Model.VersionedModel.find({ refId: req.params.id, _id: req.params.revisionBId }, fieldExclusions, { lean: 1 });
            }

            query.exec(function (err, records) {

                if (err) {
                    return cb(err);
                }

                if (!records.length) {
                    return cb (new Error('Error: Record not found.'));
                }

                return cb(null, records[0]);

            });

        },

        getPrevious: function (cb) {

            Model.VersionedModel.find({ refId: req.params.id, _id: req.params.revisionAId }, fieldExclusions, { lean: 1 }, function (err, records) {

                if (err) {
                    return cb(err);
                }

                if (!records.length) {
                    return cb (new Error('Error: Record not found.'));
                }

                return cb(null, records[0]);

            });

        },

        getLatestVersionAdditionalProps: function (cb) {

            async.waterfall([

                function (getValueDone) {

                    var query;

                    if (req.params.revisionBId === 'latest') {
                        query = Model.find({_id: req.params.id }, { dateModified: 1, modifiedBy: 1}, { lean: 1 });
                    } else {
                        query = Model.VersionedModel.find({ refId: req.params.id, _id: req.params.revisionBId }, { dateModified: 1, modifiedBy: 1}, { lean: 1 });
                    }

                    query.exec(function (err, records) {

                        if (err) {
                            return getValueDone(err);
                        }

                        if (!records.length) {
                            return getValueDone (new Error('Error: Record not found.'));
                        }

                        return getValueDone(null, records[0]);

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

                    Model.VersionedModel.find({ refId: req.params.id, _id: req.params.revisionAId }, { dateModified: 1, modifiedBy: 1}, { lean: 1 }, function (err, records) {

                        if (err) {
                            return getValueDone(err);
                        }

                        if (!records.length) {
                            return getValueDone (new Error('Error: Record not found.'));
                        }

                        return getValueDone(null, records[0]);

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

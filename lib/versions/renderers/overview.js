var templates = require('../templates'),
    linz = require('../../../'),
    async = require('async'),
    clone = require('clone');

module.exports = function versionsRenderer (req, res, record, model, settings, callback) {

    async.waterfall([

        // get a list of all the versions from the archived
        function (cb) {

            model.VersionedModel.findDocuments({
                filter: { refId: record._id },
                projection: 'dateCreated modifiedBy',
                sort: { dateCreated: -1 },
            }).exec(cb);

        }

    ], function (err, records) {

        if (err) {
            return callback(err);
        }

        if (!records.length) {
            return callback(null, '');
        }

        var locals = {
                label: model.versions.label,
                modelName: model.modelName,
                pageId: req.params.id,
                adminPath: linz.app.locals.adminPath,
                versions: [],
            };

        async.each(records, function (record, valuesDone) {

            async.series([

                function (getValueDone) {

                    settings.cellRenderers.date(record.dateCreated, record, 'dateCreated', model, function (getValueErr, result) {

                        if (getValueErr) {
                            return getValueDone(getValueErr);
                        }

                        record.date = result;

                        return getValueDone(null);

                    });

                },

                function (getValueDone) {

                    settings.cellRenderers.referenceName(record.modifiedBy, record, 'modifiedBy', model, function (getValueErr, result) {

                        if (getValueErr) {
                            return getValueDone(getValueErr);
                        }

                        record.author = result;

                        return getValueDone(null);

                    });

                },

                function (getValueDone) {

                    settings.cellRenderers.reference(record.modifiedBy, record, 'modifiedBy', model, function (getValueErr, result) {

                        if (getValueErr) {
                            return getValueDone(getValueErr);
                        }

                        record.authorLink = result;

                        return getValueDone(null);

                    });

                }

            ], function (getValueErr) {

                return valuesDone(getValueErr);

            });

        }, function (getRecordErr) {

            if (getRecordErr) {
                return callback(getRecordErr);
            }

            // construct a list of history for each version
            records.forEach(function (record, index) {

                record.history = [];

                records.forEach(function (historyRecord) {

                    if (historyRecord.dateCreated < record.dateCreated) {
                        var obj = clone(historyRecord);
                        delete obj.history;
                        record.history.push(obj);
                    }

                });

            });

            locals.versions = records;

            var content = templates.overview(locals);

            return callback(getRecordErr, content);

        });

    });

}

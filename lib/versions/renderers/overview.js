var templates = require('../templates'),
    linz = require('../../../'),
    async = require('async'),
    clone = require('clone');

module.exports = function versionsRenderer (req, res, record, model, settings, callback) {

    async.waterfall([

        // get a list of all the versions from the archived
        function (cb) {

            model.VersionedModel.find({ refId: record._id }, 'dateModified modifiedBy', { lean: 1, sort: { dateModified: -1 } }, function (err, result) {
                return cb(err, result);
            });

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

                    settings.cellRenderers.date(record.dateModified, record, 'dateModified', model, function (err, result) {

                        if (err) {
                            return getValueDone(err);
                        }

                        record.date = result;

                        return getValueDone(null);

                    });

                },

                function (getValueDone) {

                    settings.cellRenderers.referenceName(record.modifiedBy, record, 'modifiedBy', model, function (err, result) {

                        if (err) {
                            return getValueDone(err);
                        }

                        record.author = result;

                        return getValueDone(null);

                    });

                },

                function (getValueDone) {

                    settings.cellRenderers.reference(record.modifiedBy, record, 'modifiedBy', model, function (err, result) {

                        if (err) {
                            return getValueDone(err);
                        }

                        record.authorLink = result;

                        return getValueDone(null);

                    });

                }

            ], function (err) {

                return valuesDone(err);

            });

        }, function (err) {

            if (err) {
                return callback(err);
            }

            // construct a list of history for each version
            records.forEach(function (record, index) {

                record.history = [];

                records.forEach(function (historyRecord) {

                    if (historyRecord.dateModified < record.dateModified) {
                        var obj = clone(historyRecord);
                        delete obj.history;
                        record.history.push(obj);
                    }

                });

            });

            locals.versions = records;

            var content = templates.overview(locals);

            return callback(err, content);

        });

    });

}

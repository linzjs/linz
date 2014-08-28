var handlebars = require('handlebars'),
    templates = require('../templates'),
    linz = require('../../../'),
    async = require('async');

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
                label: model.overview.versions.label,
                modelName: model.modelName,
                pageId: req.params.id,
                adminPath: linz.app.locals.adminPath,
                versions: [],
            },
            content = '',
            compareList = [];

        async.each(records, function (record, valuesDone) {

            record.label = '';

            async.series([

                function (getValueDone) {

                    settings.cellRenderers.date(record.dateModified, record, 'dateModified', model, function (err, result) {

                        if (err) {
                            return valuesDone(err);
                        }

                        record.dateModified = result;
                        record.label += result;

                        return getValueDone(null);

                    });

                },

                function (getValueDone) {

                    settings.cellRenderers.referenceName(record.modifiedBy, record, 'modifiedBy', model, function (err, result) {

                        if (err) {
                            return valuesDone(err);
                        }

                        record.label += ' - ' + result;

                        return getValueDone(null);

                    });

                },

                function (getValueDone) {

                    settings.cellRenderers.reference(record.modifiedBy, record, 'modifiedBy', model, function (err, result) {

                        if (err) {
                            return valuesDone(err);
                        }

                        record.modifiedBy = result;

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

            locals.versions = records;
            content = templates.overview(locals);

            return callback(err, content);

        });



    });

}

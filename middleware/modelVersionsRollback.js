var modelVersionsCompare = require('./modelVersionsCompare'),
async = require('async');

module.exports = {

    get: modelVersionsCompare.get,

    post: function (req, res, next) {

        var Model = linz.api.model.get(req.params.model);

        async.series({

            latest: function (cb) {
                Model.findById(req.params.id, cb);
            },
            previous: function (cb) {
                var exclusions = { '_id': 0, '__v': 0, 'refId': 0, 'refVersion': 0, 'dateModified': 0, 'dateCreated': 0, 'createdBy': 0, 'modifiedBy': 0 };

                if (Model.versions.ignorePaths && Model.versions.ignorePaths.length) {
                    Model.versions.ignorePaths.forEach(function (fieldName) {
                        exclusions[fieldName] = 0;
                    });
                }

                Model.VersionedModel.findById(req.params.revisionAId, exclusions, { lean: 1 }, cb);
            }

        }, function (err, result) {

            if (err) {
                return next(err);
            }

            if (!result.latest || !result.previous) {
                return new Error('Error: Unable to find one of the records required for the rollback operation.');
            }

            // merge previous in lastet record for rollback op
            Object.keys(result.previous).forEach(function (fieldName) {
                result.latest[fieldName] = result.previous[fieldName];
            });

            if (Model.getModifiedByFieldName && Model.schema.path(Model.getModifiedByFieldName())) {
                result.latest.setModifiedBy(req, res);
            }

            result.latest.save(req, next);

        });

    }

}

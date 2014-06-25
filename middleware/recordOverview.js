var util = require('util'),
    async = require('async');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = req.linz.get('models')[req.params.model];
        var record = {};

        async.series([

            function (cb) {

                // get doc
                req.linz.model.findById(req.params.id, function (err, doc) {

                    if (err) {
                        cb(err);
                    }

                    req.linz.record = doc;
                    record = doc.toObject({ virtuals: true});

                    return cb(null);

                });


            },

            // check if doc can be edited
            function (cb) {

                // skip this if canEdit is not define for model
                if (!req.linz.record.canEdit) {
                    return cb(null);
                }

                req.linz.record.canEdit(function (err, result, message) {

                    if (err) {
                        return cb(err);
                    }

                    record.edit = { disabled: !result, message: message };

                    return cb(null);

                });



            },

            // check if doc can be deleted
            function (cb) {

                // skip this if canDelete is not define for model
                if (!req.linz.record.canDelete) {
                    return cb(null);
                }

                req.linz.record.canDelete(function (err, result, message) {

                    if (err) {
                        return cb(err);
                    }

                    record.delete = { disabled: !result, message: message };

                    return cb(null);

                });



            },

            function (cb) {

                req.linz.model.getForm(function(err,form){

                    if (err) {
                        cb(err);
                    }

                    req.linz.model.form = form;

                    return cb(null);

                });

            },

            function (cb) {

                req.linz.model.getOverview(function(err,overview){

                    if (err) {
                        cb(err);
                    }

                    req.linz.model.overview = overview;

                    return cb(null);

                });

            }

        ], function (err, results) {

            req.linz.record = record;

            return next(err);

        });

	}

}

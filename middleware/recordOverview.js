var util = require('util'),
    async = require('async');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = req.linz.get('models')[req.params.model];

        async.series([

            function (cb) {

                // get doc
                req.linz.model.findById(req.params.id, function (err, doc) {

                    if (err) {
                        cb(err);
                    }

                    req.linz.record = doc;

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

            },

            function (cb) {

                if (!req.linz.model.getVersionsSettings) {
                    return cb(null);
                }

                req.linz.model.getVersionsSettings(function (err, versions) {

                    if (err) {
                        cb(err);
                    }

                    req.linz.model.overview.versions = versions;

                    return cb(null);

                });
            }

        ], function (err, results) {

            return next(err);

        });

	}

}

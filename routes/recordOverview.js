
var async = require('async');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	var locals = {
		model: req.linz.model,
		record: req.linz.record
	};

	async.series([

        function (cb) {

            req.linz.model.overview.summary.renderer(req.linz.record, req.linz.model, function (err, content) {

                if (err) {
                    return cb(err);
                }

                locals.overviewSummary = content;

                return cb(null);

            });

        },

		function (cb) {

			if (!req.linz.model.overview.body) {

				return cb(null);

			}

			req.linz.model.overview.body(req.linz.record, req.linz.model, function (err, content) {

                if (err) {
                    return cb(err);
                }

				locals.overviewBody = content;

				return cb(null);

			});

		},

        function (cb) {

            // the overview renderer doesn't require a mongoose object
            // but rather an object literal with a few extra properties
            locals.record = req.linz.record.toObject({ virtuals: true});

            return cb(null);

        },

        // check if doc can be edited
        function (cb) {

            // skip this if canEdit is not define for model
            if (!locals.record.canEdit) {
                return cb(null);
            }

            locals.record.canEdit(function (err, result, message) {

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
            if (!locals.record.canDelete) {
                return cb(null);
            }

            locals.record.canDelete(function (err, result, message) {

                if (err) {
                    return cb(err);
                }

                record.delete = { disabled: !result, message: message };

                return cb(null);

            });



        }

	], function (err, results) {

		res.render(req.linz.views + '/recordOverview.jade', locals);

	});

};

module.exports = route;


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

			req.linz.model.overview.body.call(this, req.linz.record, req.linz.model, function (err, content) {

                if (err) {
                    return cb(err);
                }

				locals.overviewBody = content;

				return cb(null);

			});

		}

	], function (err, results) {

		res.render(req.linz.views + '/recordOverview.jade', locals);

	});

};

module.exports = route;

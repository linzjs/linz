
var async = require('async');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	var locals = {
		config: req.linz.config,
		record: req.linz.record
	};

	async.series([

        function (cb) {

            req.linz.config.overview.summary.renderer(req.linz.record, req.linz.config, function (err, content) {

                if (err) {
                    return cb(err);
                }

                locals.overviewSummary = content;

                return cb(null);

            });

        },

		function (cb) {

			if (!req.linz.config.overview.body) {

				return cb(null);

			}

			req.linz.config.overview.body(req.linz.record, req.linz.config, function (err, content) {

                if (err) {
                    return cb(err);
                }

				locals.overviewBody = content;

				return cb(null);

			});

		}

	], function (err, results) {

		res.render(req.linz.views + '/configOverview.jade', locals);

	});

};

module.exports = route;

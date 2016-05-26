
var linz = require('../'),
    async = require('async');

/* GET /admin/config/:config/overview */
var route = function (req, res) {

	var locals = {
		config: req.linz.config,
		record: req.linz.record,
		permissions: req.linz.config.linz.formtools.permissions,
		formtools: req.linz.config.linz.formtools
	};

	async.series([

        function (cb) {

            req.linz.config.linz.formtools.overview.summary.renderer(req.linz.record, req.linz.config, function (err, content) {

                if (err) {
                    return cb(err);
                }

                locals.overviewSummary = content;

                return cb(null);

            });

        },

        function (cb) {

            if (!req.linz.config.linz.formtools.overview.details) {

				return cb(null);

			}

			req.linz.config.linz.formtools.overview.details(req.linz.record, req.linz.config, function (err, content) {

                if (err) {
                    return cb(err);
                }

				locals.overviewDetail = content;

				return cb(null);

			});

        },

		function (cb) {

			if (!req.linz.config.linz.formtools.overview.body) {

				return cb(null);

			}

			req.linz.config.linz.formtools.overview.body(req.linz.record, req.linz.config, function (err, content) {

                if (err) {
                    return cb(err);
                }

				locals.overviewBody = content;

				return cb(null);

			});

		}

	], function (err, results) {

		res.render(linz.api.views.viewPath('configOverview.jade'), locals);

	});

};

module.exports = route;

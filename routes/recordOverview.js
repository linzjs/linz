
var async = require('async');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	var locals = {
		model: req.linz.model,
		record: req.linz.record
	};

	async.series([

		function (callback) {

			if (!req.linz.model.overview || !req.linz.model.overview.renderer) {

				return callback(null);

			}

			req.linz.model.overview.renderer.call(this, req.linz.record, req.linz.model, function (err, content) {
				locals.overviewBody = content;
				callback(null);
			});

		}

	], function (err, results) {

		res.render(req.linz.views + '/recordOverview.jade', locals);

	});

};

module.exports = route;

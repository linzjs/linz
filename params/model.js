
var linz = require('../'),
	async = require('async');

module.exports = function (router) {

	// set the model param on the linz namespace
	router.param('model', function (req, res, next, modelName) {

		// grab the model
		req.linz.model = linz.api.model.get(modelName);

		// setup the formtools data for this particular request
		async.parallel([

			function (cb) {

				linz.api.model.grid(req.user, modelName, function (err, grid) {

					if (err) {
						return cb(err);
					}

					req.linz.model.linz.formtools.grid = grid;

					return cb(null);

				});

			},

			function (cb) {

				linz.api.model.permissions(req.user, modelName, function (err, permissions) {

					if (err) {
						return cb(err);
					}

					req.linz.model.linz.formtools.permissions = permissions;

					return cb(null);

				});

			},

			function (cb) {

				linz.api.model.form(req.user, modelName, function (err, form) {

					if (err) {
						return cb(err);
					}

					req.linz.model.linz.formtools.form = form;

					return cb(null);

				});

			},

			function (cb) {

				linz.api.model.overview(req.user, modelName, function (err, overview) {

					if (err) {
						return cb(err);
					}

					req.linz.model.linz.formtools.overview = overview;

					return cb(null);

				});

			},

			function (cb) {

				// loop through each of the keys to determine if we have an embedded document
				// if we do, we need to call getForm with the user
				var form = req.linz.model.linz.formtools.form;

				async.forEachOf(form, function (field, key, callback) {

					if (field.type !== 'documentarray') {
						return callback();
					}

					field.schema.statics.getForm(req.user, function (err, embeddedForm) {

						if (err) {
							return callback(err);
						}

						field.linz = {
							formtools: {
								form: embeddedForm
							}
						};

						return callback(null);

					});

				}, function (err) {

					return cb(null);

				});

			}

		], function (err) {

			return next(err);

		});

	});

};

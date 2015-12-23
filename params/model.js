
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

				req.linz.model.getGrid(req.user, function (err, grid) {

					if (err) {
						return cb(err);
					}

					req.linz.model.linz.formtools.grid = grid;

					return cb(null);

				});

			},

			function (cb) {

				req.linz.model.getPermissions(req.user, function (err, permissions) {

					if (err) {
						return cb(err);
					}

					req.linz.model.linz.formtools.permissions = permissions;

					return cb(null);

				});

			},

			function (cb) {

				req.linz.model.getForm(req.user, function (err, form) {

					if (err) {
						return cb(err);
					}

					req.linz.model.linz.formtools.form = form;

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

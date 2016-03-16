
var linz = require('../'),
	async = require('async');

module.exports = function (router) {

	// set the config param on the linz namespace
	router.param('config', function (req, res, next, configName) {

		// grab the config
		req.linz.config = linz.api.configs.get(configName);

		// setup the formtools data for this particular request
		async.parallel([

			function (cb) {

				req.linz.config.linz.formtools.labels = linz.api.configs.labels(configName);

				return cb();

			},

			function (cb) {

				linz.api.configs.permissions(req.user, configName, function (err, permissions) {

					if (err) {
						return cb(err);
					}

					req.linz.config.linz.formtools.permissions = permissions;

					return cb(null);

				});

			},

			function (cb) {

				linz.api.configs.form(req.user, configName, function (err, form) {

					if (err) {
						return cb(err);
					}

					req.linz.config.linz.formtools.form = form;

					return cb(null);

				});

			},

			function (cb) {

				linz.api.configs.overview(req.user, configName, function (err, overview) {

					if (err) {
						return cb(err);
					}

					req.linz.config.linz.formtools.overview = overview;

					return cb(null);

				});

			},

			function (cb) {

				// loop through each of the keys to determine if we have an embedded document
				// if we do, we need to call getForm with the user
				var form = req.linz.config.linz.formtools.form;

				async.forEachOf(form, function (field, key, callback) {

					if (field.type !== 'documentarray') {
						return callback();
					}

					// Setup the paceholder for the embedded document. Retrieve the labels.
					field.linz = {
						formtools: {
							labels: field.schema.statics.getLabels()
						}
					};

					// Retrieve the form.
					field.schema.statics.getForm(req.user, function (err, embeddedForm) {

						if (embeddedForm) {
							field.linz.formtools.form = embeddedForm;
						}

						return callback(err);

					});

				}, function (err) {

					return cb(err);

				});

			}

		], function (err) {

			return next(err);

		});

	});

};

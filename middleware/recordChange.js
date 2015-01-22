var linz = require('../'),
	async = require('async'),
	deep = require('deep-diff'),
	moment = require('moment');

module.exports = function (req, res, next) {

	var Model = linz.get('models')[req.params.model],
		ccSettings = Model.concurrencyControl,
		formData = req.body,
		resData = {
			hasChanged: false
		},
		exclusionFields = {};

	ccSettings.settings.exclusions.forEach(function (fieldName) {
		exclusionFields[fieldName] = 0;
	});

	// exclude fields that are not editable
	Object.keys(Model.form).forEach(function (fieldName) {
		if (Model.form[fieldName].edit && Model.form[fieldName].edit.disabled) {
			exclusionFields[fieldName] = 0;
		}
	});

	// remove modifiedByProperty field if it exists in exclusion fields
	delete exclusionFields[ccSettings.modifiedByProperty];

	async.waterfall([

		function (cb) {

			Model.findById(req.params.id, exclusionFields, { lean: 1 }, function (err, doc) {

				if (err) {
					return cb(err);
				}

				return cb(null, doc);

			});
		},

		function (doc, cb) {

			if (!doc) {
				return cb(null);
			}

			ccSettings.modifiedByCellRenderer(doc[ccSettings.modifiedByProperty], doc, ccSettings.modifiedByProperty, Model, function (err, result) {
				if (err) {
					return cb(err);
				}

				doc[ccSettings.modifiedByProperty] = result;

				return cb(null, doc);
			});

		}

	], function (err, result) {

		if (!result) {
			return res.status(200).json(resData);
		}

		var theirChange = result;

		// check if version no for yourChange and theirChange, if it is the same, no changes occurred, exit!
		// also if version no from form request is the same as yourChange, this means the conflict has been resolved, exit!
		if (parseInt(formData.versionNo) === parseInt(theirChange.__v) || (req.params.versionNo && parseInt(req.params.versionNo) === parseInt(theirChange.__v))) {
			return res.status(200).json(resData);
		}

		// convert complex object to string to easy diff
		Object.keys(theirChange).forEach(function (fieldName) {

			// convert boolean and objectid to string
			if (typeof theirChange[fieldName] === 'boolean' || theirChange[fieldName] instanceof linz.mongoose.connection.db.bsonLib.ObjectID) {
				theirChange[fieldName] = theirChange[fieldName].toString();
			}

			// convert date to string in the format of 'YYYY-MM-DD'
			if (theirChange[fieldName] instanceof Date) {
				theirChange[fieldName] = moment(theirChange[fieldName]).format('YYYY-MM-DD');
			}

			// check if field is a document array
			if (Array.isArray(Model.schema.tree[fieldName])) {
				// convert object to JSON to simplify comparison
				theirChange[fieldName] = JSON.stringify(theirChange[fieldName]);
			}

		});

		var yourChange = {};

		// first let's clean up formData and remove any fields that are not relevant to this record
		Object.keys(theirChange).forEach(function (fieldName) {

			yourChange[fieldName] = formData[fieldName];

		});

		// let's do a diff for the fields changed
		var diff = deep.diff(theirChange, yourChange, function (path, key) {

			if (!theirChange[key] || theirChange[key] === null || !theirChange[key].length && yourChange[key]) {
				return true;
			}
			if (key === '__v') {
				return true;
			}
			if (theirChange[key] === null && yourChange[key] === '' || theirChange[key] === '' && yourChange[key] === null) {
				return true;
			}
			if (Array.isArray(theirChange[key]) && theirChange[key].length === 0 && (yourChange[key] === '[]' || yourChange[key] === undefined) ) {
				return true;
			}
			// ignore if theirChange = ['test'] and yourChange = 'test'
			if (Array.isArray(theirChange[key]) && theirChange[key].length === 1 && theirChange[key][0] === yourChange[key] ){
				return true;
			}
		});

		if (!diff) {
			return res.status(200).json(resData);
		}

		resData.hasChanged = true;
		resData.theirChange = theirChange;
		resData.yourChange = yourChange;
		resData.diff = diff;

		return res.status(200).json(resData);

	});

}

var linz = require('../'),
	async = require('async'),
	deep = require('deep-diff'),
	moment = require('moment');

module.exports = function (req, res, next) {

	var Model = req.linz.model,
		ccSettings = Model.concurrencyControl,
		formData = req.body,
		resData = {
			hasChanged: false
		},
		exclusionFields = {};

	var sanitiseData = function (model, exclusions, yourChange, theirChange) {

		var data = {
				yourChange: {},
				theirChange: {}
			},
			form = model.linz.formtools.form;

		model.schema.eachPath(function (fieldName, schemaType) {

			if (exclusions.hasOwnProperty(fieldName)) {
				return;
			}

			if (fieldName === '__v') {

				data.yourChange['versionNo'] = yourChange['versionNo'];
				data.theirChange['versionNo'] = theirChange['__v'];

				return;
			}

			// if transpose is defined for this field, let's tranpose their change so it can compare in the correct format on client side
			if (form[fieldName].transpose && typeof form[fieldName].transpose === 'function') {
				theirChange[fieldName] = form[fieldName].transpose(theirChange[fieldName], theirChange);
			}

			switch (form[fieldName].type) {

				case 'number':

					data.yourChange[fieldName] = parseFloat(yourChange[fieldName]);

					if (isNaN(data.yourChange[fieldName])) {
						data.yourChange[fieldName] = '';
					}

					data.theirChange[fieldName] = parseFloat(theirChange[fieldName]);

					if (isNaN(data.theirChange[fieldName])) {
						data.theirChange[fieldName] = '';
					}

					break;

				// handle multi-criteria case
				case 'boolean':
				case 'objectid':

					if (hasValue(yourChange[fieldName])) {
						data.yourChange[fieldName] = yourChange[fieldName].toString();
					} else {
						data.yourChange[fieldName] = '';
					}

					if (hasValue(theirChange[fieldName])) {
						data.theirChange[fieldName] = theirChange[fieldName].toString();
					} else {
						data.theirChange[fieldName] = '';
					}

					break;

				case 'date':
				case 'datetime':

					if (hasValue(yourChange[fieldName])) {
						data.yourChange[fieldName] = moment(new Date(yourChange[fieldName])).format('YYYY-MM-DD');
					} else {
						data.yourChange[fieldName] = '';
					}

					if (hasValue(theirChange[fieldName])) {
						data.theirChange[fieldName] = moment(new Date(theirChange[fieldName])).format('YYYY-MM-DD');
					} else {
						data.theirChange[fieldName] = '';
					}

					break;

				case 'documentarray':

					data.yourChange[fieldName] = yourChange[fieldName];
					data.theirChange[fieldName] = JSON.stringify(theirChange[fieldName]);
					break;

				case 'array':

					if (hasValue(yourChange[fieldName])) {

						// handle when array field contains only one value which is not of type array
						data.yourChange[fieldName] = yourChange[fieldName];

						if (!Array.isArray(data.yourChange[fieldName])) {
							data.yourChange[fieldName] = data.yourChange[fieldName].split();
						}

					} else {
						data.yourChange[fieldName] = [];
					}

					if (hasValue(theirChange[fieldName])) {
						data.theirChange[fieldName] = theirChange[fieldName];
					} else {
						data.theirChange[fieldName] = [];
					}

					break;

				default:
					data.yourChange[fieldName] = yourChange[fieldName];
					data.theirChange[fieldName] = theirChange[fieldName];

			}
		});

		return data;

	};

	var hasValue = function (val) {
		if (val === undefined || val === '' || val === null || val === '[]' || Array.isArray(val) && val.length === 0 || Array.isArray(val) && val.length === 1 && val[0] === '') {
			return false;
		}
		return true;
	}

	ccSettings.settings.exclusions.forEach(function (fieldName) {
		exclusionFields[fieldName] = 0;
	});

    // Exclude fields that are not editable.
    if (Model.linz.formtools.form) {

        Object.keys(Model.linz.formtools.form).forEach((fieldName) => {

            if (Model.linz.formtools.form[fieldName].edit && Model.linz.formtools.form[fieldName].edit.disabled) {
                exclusionFields[fieldName] = 0;
            }

        });

    }

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

		var cleanData = sanitiseData(Model, exclusionFields, formData, result),
			yourChange = cleanData.yourChange,
			theirChange = cleanData.theirChange;

		// check if version number for yourChange and theirChange, if it is the same, no changes occurred, exit!
		// also check if version number from form request is the same as yourChange, this means the conflict has been resolved, exit!
		if (parseInt(yourChange.versionNo) === parseInt(theirChange.versionNo) || (req.params.versionNo && parseInt(req.params.versionNo) === parseInt(theirChange.versionNo))) {

			return res.status(200).json(resData);
		}

		// let's do a diff for the fields changed
		var diffResult = deep.diff(theirChange, yourChange, function (path, key) {

			if (key === 'versionNo') {
				return true;
			}

		});

		if (!diffResult || (diffResult.length === 1 && diffResult[0].path && diffResult[0].path[0] === 'modifiedBy')) {
			// exit if there is not diff result or if diff result only contains the modifiedBy field
			return res.status(200).json(resData);
		}

		var diffKeys = {};

		// get a list of unique field names and it's type
		diffResult.forEach(function (diff) {

			var fieldName = diff.path[0];

			// change fieldname to the related field defined in the relationship
            if (Model.linz.formtools.form && Model.linz.formtools.form[fieldName].relationship) {
				fieldName = Model.linz.formtools.form[fieldName].relationship;
			}

            if (Model.linz.formtools.form && !diffKeys[fieldName]) {
				diffKeys[fieldName] = Model.linz.formtools.form[fieldName].type;
			}

		});

		resData.hasChanged = true;
		resData.theirChange = theirChange;
		resData.yourChange = yourChange;
		resData.diff = diffKeys;

		return res.status(200).json(resData);

	});

}

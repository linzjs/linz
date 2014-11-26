var linz = require('../'),
	async = require('async'),
	deep = require('deep-diff');

module.exports = function (req, res, next) {

	var Model = linz.get('models')[req.params.model];

	var formData = req.body,
		resData = {
			hasChanged: false
		},
		exclusionFields = {
			'_id': 0,
	        'refId': 0,
	        'refVersion': 0,
			'dateModified': 0,
	        'dateCreated': 0,
			'createdBy': 0	 // TODO: this field might need to be dynamic as it's included as part of Linz model
		};

	// exclude fields that are not editable
	Object.keys(Model.form).forEach(function (fieldName) {
		if (Model.form[fieldName].edit && Model.form[fieldName].edit.disabled) {
			exclusionFields[fieldName] = 0;
		}
	});

	// exclude fields defined by versions compare
	if ((Model.versions.compare && Model.versions.compare.exclusions)) {
		Object.keys(Model.versions.compare.exclusions).forEach(function (fieldName) {
            exclusionFields[fieldName] = 0;
        });
	}

	// remove modifiedBy field from exclusion fields
	delete exclusionFields['modifiedBy'];

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
			Model.versions.cellRenderers.referenceName(doc.modifiedBy, doc, 'modifiedBy', Model, function (err, result) {
				if (err) {
					return cb(err);
				}

				doc.modifiedBy = result;

				return cb(null, doc);
			});
		}

	], function (err, result) {

		var revisionA = result;
		// convert complex object to string to easy diff
		Object.keys(revisionA).forEach(function (fieldName) {

			// convert objectid to string
			if (revisionA[fieldName] instanceof linz.mongoose.connection.db.bsonLib.ObjectID) {
				revisionA[fieldName] = revisionA[fieldName].toString();
			}

			// convert date to short format
			if (revisionA[fieldName] instanceof Date) {
				revisionA[fieldName] = revisionA[fieldName].getFullYear().toString() + '-' + (revisionA[fieldName].getMonth()+1).toString() + '-' + revisionA[fieldName].getDate().toString();
			}
		});

		// TODO: re-instate this
		// check if this record has been changed while user is editing this record
		// if (parseInt(formData.versionNo) === parseInt(revisionA.__v)) {
		// 	return res.status(200).json(resData);
		// }

		var revisionB = {};

		// first let's clean up formData and remove any fields that are not relevant to this record
		Object.keys(revisionA).forEach(function (fieldName) {
			if (formData[fieldName] === 'true') {
				formData[fieldName] = true;
			}
			if (formData[fieldName] === 'false') {
				formData[fieldName] = false;
			}

			revisionB[fieldName] = formData[fieldName];
		});

		// TODO: remove this!
		revisionB.businessName = 'yo stinkyQ';

		// let's do a diff for the fields changed
		var diff = deep.diff(revisionA, revisionB, function (path, key) {
			if (key === '__v') {
				return true;
			}
			if (revisionA[key] === null && revisionB[key] === '' || revisionA[key] === '' && revisionB[key] === null) {
				return true;
			}
			if (Array.isArray(revisionA[key]) && revisionA[key].length === 0 && (revisionB[key] === '[]' || revisionB[key] === undefined) ) {
				return true;
			}
		});

		if (!diff) {
			return res.status(200).json(resData);
		}

		resData.hasChanged = true;
		resData.revisionA = revisionA;
		resData.revisionB = revisionB;
		resData.diff = diff;

		return res.status(200).json(resData);

	});

}

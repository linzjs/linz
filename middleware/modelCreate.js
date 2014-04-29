var util = require('util');

module.exports = function (model) {

	return function (req, res, next) {

		req.linz.model = req.linz.get('models')[req.params.model];

		// add the field labels to the model
		req.linz.model.getFieldLabels(function (err, fieldLabels) {

			req.linz.model.fieldLabels = fieldLabels;

			next();

		});

	}

}
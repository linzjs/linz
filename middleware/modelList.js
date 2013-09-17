var util = require('util');

module.exports = function (linz) {

	return function (req, res, next) {

		// update res.locals to include an employee flag if a cookie exists
		req.linz = linz.getModelList();

		next();

	}

}
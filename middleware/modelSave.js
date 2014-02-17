var util = require('util');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = req.linz.get('models')[req.params.model];

		next();

	}

}
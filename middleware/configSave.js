var util = require('util');

module.exports = function () {

	return function (req, res, next) {

		req.linz.config = req.linz.get('configs')[req.params.config];

        return next();

	}

}

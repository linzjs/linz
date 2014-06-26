var linz = require('../');

module.exports = function () {

	return function (req, res, next) {

		req.linz.config = linz.get('configs')[req.params.config];

        return next();

	}

}

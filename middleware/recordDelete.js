var linz = require('../');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = linz.api.model.get(req.params.model);

		req.linz.model.getObject(req.params.id, function (err, doc) {

			if (!err) {
				req.linz.record = doc;
			}

			next();

		});

	}

}

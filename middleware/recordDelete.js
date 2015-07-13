var linz = require('linz');

module.exports = function () {

	return function (req, res, next) {

		// simply return all docs
		req.linz.model.findById(req.params.id, function (err, doc) {

			if (!err) {
				req.linz.record = doc;
			}

			next();

		});

	}

}

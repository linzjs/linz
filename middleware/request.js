var util = require('util'),
	fs = require('fs');

module.exports = function () {

	return function (req, res, next) {

        // setup request local
        res.locals['request'] = {
            path: req.path,
            query: req.query,
            protocol: req.protocol
        };

        return next();

	}

}

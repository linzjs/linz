
var linz = require('../');

module.exports = function (router) {

	// set the config param on the linz namespace
	router.param('config', function (req, res, next, configName) {
		req.linz.config = linz.api.configs.get(configName);
		return next(null);
	});

};

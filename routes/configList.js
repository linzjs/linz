var linz = require('../');

/* GET /admin/configs/list */
var route = function (req, res) {

	var canEdit = Object.keys(req.linz.configsPerm).some(function (configName) {
		return req.linz.configsPerm[configName].edit;
	});

	var canReset = Object.keys(req.linz.configsPerm).some(function (configName) {
		return req.linz.configsPerm[configName].reset;
	});

	res.render(linz.api.views.viewPath('configList.jade'), {
		grid: req.linz.configGrid,
		configs: req.linz.configs,
		records: req.linz.records,
		permissions: req.linz.configsPerm,
		canEdit: canEdit,
		canReset: canReset
	});

};

module.exports = route;

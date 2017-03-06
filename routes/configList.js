var linz = require('../'),
	async = require('async');

/* GET /admin/configs/list */
var route = function (req, res) {

	// determine if we need to render the actions column
	async.some(req.linz.records, function (record, cb) {

		// if any of these records can edit or reset, we should show the column
		if (record.permissions.canEdit !== false || record.permissions.canReset !== false) {
			return cb(true);
		}

		return cb(false);

	}, function (renderActionsColumn) {

		res.render(linz.api.views.viewPath('configList.jade'), {
			list: req.linz.configList,
			configs: req.linz.configs,
			records: req.linz.records,
			renderActionsColumn: renderActionsColumn
		});

	});

};

module.exports = route;

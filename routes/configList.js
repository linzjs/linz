var linz = require('../');

/* GET /admin/configs/list */
var route = function (req, res) {

	res.render(linz.views + '/configList.jade', { grid: req.linz.configGrid, configs: req.linz.configs, records: req.linz.records });

};

module.exports = route;

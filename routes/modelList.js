var path = require('path');

/* GET /admin/models/list */
var route = function (req, res) {

	res.render(req.linz.views + '/modelList.jade', { models: req.linz.listModels() });

};

module.exports = route;
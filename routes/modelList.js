var path = require('path');

/* GET /admin/models/list */
var route = function (req, res) {

	var models = req.linz.getModels();

	res.render(req.linz.views + '/modelList.jade', { models: models });
	console.log(models);

};

module.exports = route;
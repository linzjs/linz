var path = require('path');

/* GET /admin/models/list */
var route = function (req, res) {

	var models = req.linz.get('models');

	res.render(req.linz.views + '/modelList.jade', { models: models });

};

module.exports = route;
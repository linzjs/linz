

/* GET /admin/model/:model/list */
var route = function (req, res) {

	res.render(req.linz.views + '/modelIndex.jade', {
		modelLabel: req.linz.model.label,
		models: req.linz.models,
		count: req.linz.models.length
	});

};

module.exports = route;
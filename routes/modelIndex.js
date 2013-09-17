

/* GET /admin/model/:model/list */
var route = function (req, res) {

	res.render(req.linz.views + '/modelIndex.jade', {
		modelLabel: req.linz.model.label,
		records: req.linz.records,
		count: req.linz.records.length
	});

};

module.exports = route;
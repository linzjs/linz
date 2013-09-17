

/* GET /admin/model/:model/list */
var route = function (req, res) {

	console.log('req.linz.model: ' + req.linz.model.modelName);
	console.log(req.linz.model);

	res.render(req.linz.views + '/modelIndex.jade', {
		model: req.linz.model,
		records: req.linz.records,
		count: req.linz.records.length
	});

};

module.exports = route;
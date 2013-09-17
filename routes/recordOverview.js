

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	res.render(req.linz.views + '/recordOverview.jade', {
		model: req.linz.model,
		record: req.linz.record
	});

};

module.exports = route;
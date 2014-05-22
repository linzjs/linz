

/* GET /admin/model/:model/list */
var route = function (req, res) {

	res.render(req.linz.views + '/modelIndex.jade', {
		model: req.linz.model,
		records: req.linz.records,
        bDevelopment: process.env.NODE_ENV,
        form: req.body || {}
	});

};

module.exports = route;

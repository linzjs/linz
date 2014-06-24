var linz = require('../');

/* GET /admin/model/:model/list */
var route = function (req, res) {

    var total = Number(req.linz.records.total),
        pageSize = Number(req.linz.records.pageSize),
        page = Number(req.linz.records.page),
        pages = Number(req.linz.records.pages),
        to = pageSize*page;

    if (to > total) {
        to = total;
    }

	res.render(req.linz.views + '/modelIndex.jade', {
		model: req.linz.model,
        form: req.body || {},
		records: req.linz.records.records,
        page: page,
        total: total,
        pages: pages,
        pageSize: pageSize,
        pageSizes: req.linz.model.grid.paging.sizes || linz.get('page sizes'),
        from: pageSize*page-pageSize,
        to: to,
        pagination: (req.linz.model.grid.paging.active === true && total > pageSize)
	});

};

module.exports = route;

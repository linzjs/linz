var linz = require('../'),
    inflection = require('inflection');

/* GET /admin/model/:model/list */
var route = function (req, res) {

    var total = Number(req.linz.records.total),
        pageSize = Number(req.linz.records.pageSize),
        page = Number(req.linz.records.page),
        pages = Number(req.linz.records.pages),
        to = pageSize*page,
        sortDirection = '';

    if (to > total) {
        to = total;
    }

    if (Object.keys(req.linz.model.grid.sortingBy).length) {

        if (!req.linz.model.formData.sort) {
            req.linz.model.formData.sort = req.linz.model.grid.sortingBy.field;
        }

        sortDirection = ((req.linz.model.formData.sort.charAt(0) === '-') ? 'desc' : 'asc')
    }

	res.render(linz.views + '/modelIndex.jade', {
		model: req.linz.model,
        form: req.linz.model.formData || {},
		records: req.linz.records.records,
        page: page,
        total: total,
        pages: pages,
        pageSize: pageSize,
        pageSizes: req.linz.model.grid.paging.sizes || linz.get('page sizes'),
        from: pageSize*page-pageSize,
        to: to,
        pagination: (req.linz.model.grid.paging.active === true && total > pageSize),
        sort: req.linz.model.grid.sortingBy,
        sortDirection: sortDirection,
        label: {
            singular: inflection.humanize(req.linz.model.formtools.model.label, true),
            plural: req.linz.model.formtools.model.plural
        },
        modelQuery: JSON.stringify(req.linz.model.formData)
	});

};

module.exports = route;

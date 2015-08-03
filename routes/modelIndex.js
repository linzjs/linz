var linz = require('../'),
    inflection = require('inflection');

/* GET /admin/model/:model/list */
var route = function (req, res, next) {

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

    // define default grid record actions modal settings in a format that jade can access easily
    req.linz.model.grid.recordActions.forEach(function (action) {

        var modal = { active: false };

        if (typeof action.modal === 'object') {
            modal = action.modal;
            modal.active = true;
        } else if (typeof action.modal === 'boolean') {
            modal.active = action.modal;
        }

        action.modal = modal;

    });

    // define default grid action modal settings in a format that jade can access easily
    req.linz.model.grid.actions.forEach(function (action) {

        var modal = { active: false };

        if (typeof action.modal === 'object') {
            modal = action.modal;
            modal.active = true;
        } else if (typeof action.modal === 'boolean') {
            modal.active = action.modal;
        }

        action.modal = modal;

    });

    res.render(linz.api.views.viewPath('modelIndex.jade'), {
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
            singular: inflection.humanize(req.linz.model.linz.formtools.model.label, true),
            plural: req.linz.model.linz.formtools.model.plural
        },
        modelQuery: JSON.stringify(req.linz.model.formData)
    });

};

module.exports = route;

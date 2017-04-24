const linz = require('../');
const inflection = require('inflection');
const listRenderers = require('../lib/formtools/renderers-list');
const recordActionRenderers = require('../lib/formtools/renderers-action-record');

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

    if (Object.keys(req.linz.model.list.sortingBy).length) {

        if (!req.linz.model.formData.sort) {
            req.linz.model.formData.sort = req.linz.model.list.sortingBy.field;
        }

        sortDirection = ((req.linz.model.formData.sort.charAt(0) === '-') ? 'desc' : 'asc')
    }

    // define default list record actions modal settings in a format that jade can access easily
    req.linz.model.list.recordActions.forEach(function (action) {

        var modal = { active: false };

        if (typeof action.modal === 'object') {
            modal = action.modal;
            modal.active = true;
        } else if (typeof action.modal === 'boolean') {
            modal.active = action.modal;
        }

        action.modal = modal;

    });

    // define default list action modal settings in a format that jade can access easily
    req.linz.model.list.actions.forEach(function (action) {

        var modal = { active: false };

        if (typeof action.modal === 'object') {
            modal = action.modal;
            modal.active = true;
        } else if (typeof action.modal === 'boolean') {
            modal.active = action.modal;
        }

        action.modal = modal;

    });

    const data = {
        model: req.linz.model,
        permissions: req.linz.model.linz.formtools.permissions,
        form: req.linz.model.formData || {},
        records: req.linz.records.records,
        page: page,
        total: total,
        pages: pages,
        pageSize: pageSize,
        pageSizes: req.linz.model.list.paging.sizes || linz.get('page sizes'),
        from: pageSize*page-pageSize,
        to: to,
        pagination: (req.linz.model.list.paging.active === true && total > pageSize),
        sort: req.linz.model.list.sortingBy,
        sortDirection: sortDirection,
        label: {
            singular: inflection.humanize(req.linz.model.linz.formtools.model.label, true),
            plural: req.linz.model.linz.formtools.model.plural
        },
        modelQuery: JSON.stringify(req.linz.model.formData),
        user: req.user
    };

    const renderRecordAction = data.model.list.recordActions.renderer || recordActionRenderers.defaultRenderer;

    data.records.forEach((record, index) => {

        renderRecordAction({
            model: data.model,
            permissions: data.permissions,
            record
        }, (err, html) => {

            // Throw rather than return to break out of the loop.
            if (err) {
                throw err;
            }

            data.records[index].actionsTemplate = html;

        });

    });

    const renderList = data.model.list.renderer || listRenderers.default;

    renderList(data, (err, html) => {

        if (err) {
            return res.send(err);
        }

        data.records.template = html;

        return res.render(linz.api.views.viewPath('modelIndex.jade'), data);

    });

};

module.exports = route;

const linz = require('../');
const inflection = require('inflection');
const listRenderers = require('../lib/formtools/renderers-list');
const recordActionRenderers = require('../lib/formtools/renderers-action-record');
const async = require('async');

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

    const { actions, recordActions } = req.linz.model.list;
    const { parseModalProperties } = linz.api.formtools.actions;

    req.linz.model.list.actions = parseModalProperties(actions);
    req.linz.model.list.recordActions = parseModalProperties(recordActions);

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
        user: req.user,
        query: req.query
    };

    async.parallel([

        (cb) => {

            if (!req.linz.notifications.length) {
                return cb();
            }

            linz.api.views.renderPartial('notifications', { notifications: req.linz.notifications }, (err, notificationHtml) => {

                if (err) {
                    return res.send(err);
                }

                data.notifications = notificationHtml;

                return cb();

            });

        },

        (cb) => {

            const renderRecordAction = data.model.list.recordActions.renderer || recordActionRenderers.defaultRenderer;

            async.eachOf(data.records, (record, index, callback) => {

                renderRecordAction({
                    model: data.model,
                    permissions: data.permissions,
                    record
                }, (err, html) => {

                    data.records[index].actionsTemplate = html;

                    callback(err);

                });

            }, cb);

        }

    ], (err) => {

        if (err) {
            return res.send(err);
        }

        const renderList = data.model.list.renderer || listRenderers.default;

        renderList(data, (renderErr, html) => {

            if (renderErr) {
                return res.send(renderErr);
            }

            data.records.template = html;

            return res.render(linz.api.views.viewPath('modelIndex.jade'), data);

        });

    });

};

module.exports = route;

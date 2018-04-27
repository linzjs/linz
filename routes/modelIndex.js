'use strict';

const async = require('async');
const inflection = require('inflection');
const linz = require('../');
const listRenderers = require('../lib/formtools/renderers-list');
const recordActionRenderers = require('../lib/formtools/renderers-action-record');

/* GET /admin/model/:model/list */
var route = function (req, res, next) {

    Promise.all([
        linz.api.views.getScripts(req, res, [
            {
                src: `${linz.get('admin path')}/public/js/template.polyfill.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/model/index.js?v5`,
            },
        ]),
        linz.api.views.getStyles(req, res),
    ])
        .then(([scripts, styles]) => {

            var total = Number(req.linz.records.total),
                pageSize = Number(req.linz.records.pageSize),
                page = Number(req.linz.records.page),
                pages = Number(req.linz.records.pages),
                to = pageSize*page,
                sortDirection = '',
                form = req.linz.model.formData || {};

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

            // Create a list of primary recordActions.
            req.linz.model.list.primaryRecordActions = req.linz.model.list.recordActions.filter(action => action.type === 'primary');

            // Remove the primary record actions, from the standard ones.
            req.linz.model.list.recordActions = req.linz.model.list.recordActions.filter(action => action.type !== 'primary');

            // Work through the sorting options.
            const sortingOptions = [];

            req.linz.model.list.sortBy.forEach(function (sortBy) {

                const sort = form.sort || '';
                const sortFieldName = sort.replace('/^-/', '');

                // Don't display ascending, if it's already sorting ascending on this field.
                if (sortFieldName.toLowerCase() != sortBy.field.toLowerCase()) {

                    sortingOptions.push({
                        label: `${sortBy.label} <em>(ascending)</em>`,
                        value: `${sortBy.field}`,
                    });

                }

                // Don't display descending, if it's already sorting descending on this field.
                if (sort.toLowerCase() !== `-${sortBy.field}`.toLowerCase()) {

                    sortingOptions.push({
                        label: `${sortBy.label} <em>(descending)</em>`,
                        value: `-${sortBy.field}`,
                    });

                }

            });

            const data = {
                customAttributes: res.locals.customAttributes,
                form,
                from: pageSize*page-pageSize,
                help: req.linz.model.list.help,
                label: {
                    singular: inflection.humanize(req.linz.model.linz.formtools.model.label, true),
                    plural: req.linz.model.linz.formtools.model.plural,
                },
                model: req.linz.model,
                modelQuery: JSON.stringify(req.linz.model.formData),
                page,
                pages,
                pageTitle: req.linz.model.linz.formtools.model.plural,
                pageSize,
                pageSizes: req.linz.model.list.paging.sizes || linz.get('page sizes'),
                pagination: req.linz.model.list.paging.active === true,
                permissions: req.linz.model.linz.formtools.permissions,
                query: req.query,
                records: req.linz.records.records,
                sort: req.linz.model.list.sortingBy,
                sortDirection,
                sortingOptions,
                to,
                total,
                scripts,
                styles,
                user: req.user,
                view: 'model-list',
            };

            async.parallel([

                (cb) => {

                    linz.api.views.renderNotifications(req, (err, notificationHtml) => {

                        if (err) {
                            return cb(err);
                        }

                        if (notificationHtml) {
                            data.notifications = notificationHtml;
                        }

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

        })
        .catch(next);

};

module.exports = route;

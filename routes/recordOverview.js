'use strict';

const async = require('async');
const clone = require('clone');
const linz = require('../');


/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    // Skip to a 404 page.
    if (!req.linz.record) {
        return next();
    }

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

            var locals = {
                csrfToken: req.csrfToken(),
                customAttributes: res.locals.customAttributes,
                formtools: req.linz.model.linz.formtools,
                model: req.linz.model,
                overview: req.linz.overview,
                pageTitle: req.linz.record.title,
                permissions: req.linz.model.linz.formtools.permissions,
                record: clone(req.linz.record.toObject({ virtuals: true})),
                scripts,
                styles,
                user: req.user,
                view: 'record-overview',
            };

            if (Array.isArray(locals.overview.body)) {

                // Set tabId to each tab in locals.overview.body
                linz.formtools.overview.setTabId(locals.overview.body);

            }

            async.series([

                function (cb) {

                    linz.api.views.renderNotifications(req, (err, notificationHtml) => {

                        if (err) {
                            return cb(err);
                        }

                        if (notificationHtml) {
                            locals.notifications = notificationHtml;
                        }

                        return cb();

                    });

                },

                // check if doc can be edited
                function (cb) {

                    // skip this if canEdit is not define for model
                    if (!req.linz.record.canEdit) {
                        return cb(null);
                    }

                    req.linz.record.canEdit(req, function (err, result, message) {

                        if (err) {
                            return cb(err);
                        }

                        locals.record.edit = { disabled: !result, message: message };

                        return cb(null);

                    });

                },

                // check if doc can be deleted
                function (cb) {

                    // skip this if canDelete is not define for model
                    if (!req.linz.record.canDelete) {
                        return cb(null);
                    }

                    req.linz.record.canDelete(req, function (err, result, message) {

                        if (err) {
                            return cb(err);
                        }

                        locals.record.delete = { disabled: !result, message: message };

                        return cb(null);

                    });

                }

            ], function (err) {

                if (err) {
                    return next(err);
                }

                const { actions, footerActions } = req.linz.model.linz.formtools.overview;
                const { parseModalProperties } = linz.api.formtools.actions;

                req.linz.model.linz.formtools.overview.actions = parseModalProperties(actions);
                req.linz.model.linz.formtools.overview.footerActions = parseModalProperties(footerActions);

                // Determine if we have any primary record actions.
                req.linz.model.linz.formtools.overview.primaryActions = req.linz.model.linz.formtools.overview.actions.filter(action => action.type === 'primary');

                req.linz.model.linz.formtools.overview.actions = req.linz.model.linz.formtools.overview.actions.filter(action => action.type !== 'primary');

                res.render(linz.api.views.viewPath('recordOverview.jade'), locals);

            });

        })
        .catch(next);

};

module.exports = route;

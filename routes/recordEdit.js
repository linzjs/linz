'use strict';

const linz = require('../');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    // Skip to a 404 page.
    if (!req.linz.record) {
        return next();
    }

    linz.api.model.generateForm(req.linz.model, {
        record: req.linz.record,
        req,
        type: 'edit',
    })
        .then((editForm) => {

            var conflictHandlersJS = '\n\t',
                registeredConflictHandlers = {};

            editForm.elements.forEach(function (element) {

                if (!element.elements) {
                    return;
                }

                element.elements.forEach(function (field) {

                    if (!field.conflictHandler || registeredConflictHandlers[field.conflictHandler.name]) {
                        // do nothing if conflictHandler is undefined or it has been registered
                        return;
                    }

                    conflictHandlersJS += field.conflictHandler.toString() + '\n\t';

                    // register function name
                    registeredConflictHandlers[field.conflictHandler.name] = 1;

                });

            });

            // make JS function accessible via linz namespace
            Object.keys(registeredConflictHandlers).forEach(function (fnName) {
                conflictHandlersJS += 'linz.' + fnName + ' = ' + fnName + ';\n\t' ;
            });

            // wrap code in self-executable function
            conflictHandlersJS = '\n\t(function () {\n\t' + conflictHandlersJS + '\n\t})();';

            const defaultScripts = [
                {
                    src: '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js',
                    integrity: 'sha256-0JaDbGZRXlzkFbV8Xi8ZhH/zZ6QQM0Y3dCkYZ7JYq34=',
                    crossorigin: 'anonymous',
                },
                {
                    src: `${linz.get('admin path')}/public/js/jquery.binddata.js?v1`,
                },
                {
                    src: `${linz.get('admin path')}/public/js/documentarray.js?v2`,
                },
                {
                    integrity: 'sha256-/wPGlKXtfdj9ryVH2IQ78d1Zx2/4PXT/leOL4Jt1qGU=',
                    src: '//cdnjs.cloudflare.com/ajax/libs/deep-diff/0.2.0/deep-diff.min.js',
                    crossorigin: 'anonymous',
                },
                {
                    integrity: 'sha256-ytdI1WZJO3kDPOAKDA5t95ehNAppkvcx0oPRRAsONGo=',
                    src: '//cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.min.js',
                    crossorigin: 'anonymous',
                },
                {
                    src: `${linz.get('admin path')}/public/js/model/edit.js`,
                },
            ];

            if (req.linz.model.concurrencyControl) {
                defaultScripts.push({
                    src: `${linz.get('admin path')}/public/js/model/check-record-changes.js?v1`,
                });
            }

            const data = {};

            (function (cb) {

                linz.api.views.renderNotifications(req, (err, notificationHtml) => {

                    if (err) {
                        return cb(err);
                    }

                    if (notificationHtml) {
                        data.notifications = notificationHtml;
                    }

                    return cb();

                });

            })(function () {

                Promise.all([
                    linz.api.views.getScripts(req, res, defaultScripts),
                    linz.api.views.getStyles(req, res),
                ])
                    .then(([scripts, styles]) => {

                        return res.render(linz.api.views.viewPath('recordEdit.jade'), Object.assign(data, {
                            cancelUrl: linz.api.url.getAdminLink(req.linz.model),
                            conflictHandlersJS: conflictHandlersJS,
                            csrfToken: req.csrfToken(),
                            form: editForm.render(),
                            model: req.linz.model,
                            record: req.linz.record,
                            actionUrl: linz.api.url.getAdminLink(req.linz.model, 'save', req.linz.record._id),
                            customAttributes: res.locals.customAttributes,
                            pageTitle: `Editing '${req.linz.record.title}'`,
                            scripts,
                            styles,
                            view: 'record-edit',
                        }));

                    })
                    .catch(next);

            });

        })
        .catch(next);

};

module.exports = route;

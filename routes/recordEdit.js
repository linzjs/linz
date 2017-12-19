'use strict';

const linz = require('../');

/* GET /admin/:model/:id/overview */
const route = (req, res, next) => {

    // Skip to a 404 page.
    if (!req.linz.record) {
        return next();
    }

    const defaultScripts = [
        {
            src: '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js',
            integrity: 'sha256-0JaDbGZRXlzkFbV8Xi8ZhH/zZ6QQM0Y3dCkYZ7JYq34=',
            crossorigin: 'anonymous',
        },
        {
            src: `${linz.get('admin path')}/public/js/jquery.binddata.js`,
        },
        {
            src: `${linz.get('admin path')}/public/js/documentarray.js`,
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

    let conflictHandlersJS = '\n\t';
    const registeredConflictHandlers = {};
    const data = {};

    // This needs some work.
    // I'm sure it could be rewritten to be much nicer.

    linz.api.model.generateForm({
        form: req.linz.model.linz.formtools.form,
        record: req.linz.record,
        schema: req.linz.model.schema,
        type: 'edit',
    })
        .then(editForm => new Promise((resolve, reject) => {

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

            if (req.linz.model.concurrencyControl) {
                defaultScripts.push({
                    src: `${linz.get('admin path')}/public/js/model/check-record-changes.js`,
                });
            }

            linz.api.views.renderNotifications(req, (err, notificationHtml) => {

                if (err) {
                    return reject(err);
                }

                if (notificationHtml) {
                    data.notifications = notificationHtml;
                }

                return resolve(editForm);

            });

        }))
        .then(editForm => Promise.all([
            editForm,
            linz.api.views.getScripts(req, res, defaultScripts),
            linz.api.views.getStyles(req, res),
        ]))
        .then(([editForm, scripts, styles]) => res.render(linz.api.views.viewPath('recordEdit.jade'), Object.assign(data, {
            cancelUrl: linz.api.url.getAdminLink(req.linz.model),
            conflictHandlersJS: conflictHandlersJS,
            form: editForm.render(),
            model: req.linz.model,
            record: req.linz.record,
            actionUrl: linz.api.url.getAdminLink(req.linz.model, 'save', req.linz.record._id),
            customAttributes: res.locals.customAttributes,
            pageTitle: `Editing '${req.linz.record.title}'`,
            scripts,
            styles,
            view: 'record-edit',
        })))
        .catch(next);

};

module.exports = route;

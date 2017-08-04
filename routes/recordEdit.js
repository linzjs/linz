'use strict';

const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    linz.formtools.form.generateFormFromModel(req.linz.model.schema, req.linz.model.linz.formtools.form, req.linz.record, 'edit', function (err, editForm) {

        if (err) {
            return next(err);
        }

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
                src: `${linz.get('admin path')}/public/js/jquery.binddata.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/documentarray.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/deep-diff-0.2.0.min.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/json2.js`,
            },
            {
                src: `${linz.get('admin path')}/public/js/model/edit.js`,
            },
        ];

        if (req.linz.model.concurrencyControl) {
            defaultScripts.push({
                src: `${linz.get('admin path')}/public/js/model/check-record-changes.js`,
            });
        }

        Promise.all([
            setTemplateScripts(req, res, defaultScripts),
            setTemplateStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('recordEdit.jade'), {
                    cancelUrl: linz.api.url.getAdminLink(req.linz.model),
                    conflictHandlersJS: conflictHandlersJS,
                    form: editForm.render(),
                    model: req.linz.model,
                    record: req.linz.record,
                    actionUrl: linz.api.url.getAdminLink(req.linz.model, 'save', req.linz.record._id),
                    customAttributes: res.locals.customAttributes,
                    scripts,
                    styles,
                });

            })
            .catch(next);

    });

};

module.exports = route;

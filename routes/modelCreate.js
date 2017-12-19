'use strict';

const inflection = require('inflection');
const linz = require('../');

/* GET /admin/model/:model/create */
var route = function (req, res, next) {

    const data = {};

    linz.api.model.generateForm({
        form: req.linz.model.linz.formtools.form,
        record: {},
        schema: req.linz.model.schema,
        type: 'create',
    })
        .then(editForm => new Promise((resolve, reject) => {

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
            linz.api.views.getScripts(req, res, [
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
                    src: `${linz.get('admin path')}/public/js/model/edit.js`,
                },
            ]),
            linz.api.views.getStyles(req, res),
        ]))
        .then(([editForm, scripts, styles]) => {

            const singular = inflection.humanize(req.linz.model.linz.formtools.model.label, true);

            return res.render(linz.api.views.viewPath('modelCreate.jade'), Object.assign(data, {
                actionUrl: linz.api.url.getAdminLink(req.linz.model, 'create'),
                cancelUrl: linz.api.url.getAdminLink(req.linz.model),
                form: editForm.render(),
                label: {
                    singular,
                    plural: req.linz.model.linz.formtools.model.plural,
                },
                model: req.linz.model,
                pageTitle: `Create a new ${singular}`,
                scripts,
                styles,
                view: 'model-create',
            }));

        })
        .catch(next);

};

module.exports = route;

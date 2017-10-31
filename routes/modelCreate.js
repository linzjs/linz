'use strict';

const inflection = require('inflection');
const linz = require('../');

/* GET /admin/model/:model/create */
var route = function (req, res, next) {

    linz.formtools.form.generateFormFromModel(req.linz.model.schema, req.linz.model.linz.formtools.form, {}, 'create', function (err, editForm) {

        if (err) {
            return next(err);
        }

        Promise.all([
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
        ])
            .then(([scripts, styles]) => {

                const singular = inflection.humanize(req.linz.model.linz.formtools.model.label, true);

                return res.render(linz.api.views.viewPath('modelCreate.jade'), {
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
                });

            })
            .catch(next);

    });

};

module.exports = route;

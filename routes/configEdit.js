'use strict';

const linz = require('../');

/* GET /admin/config/:config/overview */
var route = function (req, res, next) {

    let editForm = {};

    linz.api.model.generateForm(req.linz.model, {
        record: req.linz.record,
        type: 'edit',
    })
        .then((form) => {

            editForm = form;

            return Promise.all([
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
                        src: `${linz.get('admin path')}/public/js/documentarray.js?v1`,
                    },
                    {
                        src: `${linz.get('admin path')}/public/js/model/edit.js`,
                    },
                ]),
                linz.api.views.getStyles(req, res),
            ]);

        })
        .then(([scripts, styles]) => res.render(linz.api.views.viewPath('configEdit.jade'), {
            actionUrl: linz.api.url.getAdminLink(req.linz.config, 'save', req.linz.record._id),
            cancelUrl: linz.api.url.getAdminLink(req.linz.config, 'list'),
            form: editForm.render(),
            record: req.linz.record,
            scripts,
            styles,
        }))
        .catch(next);

};

module.exports = route;

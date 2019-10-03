'use strict';

const linz = require('../');

/* GET /admin/config/:config/overview */
var route = function(req, res, next) {
    linz.formtools.form.generateFormFromModel(
        req.linz.config.schema,
        req.linz.config.linz.formtools.form,
        req.linz.record,
        'edit',
        function(err, editForm) {
            if (err) {
                return next(err);
            }

            Promise.all([
                linz.api.views.getScripts(req, res, [
                    {
                        src:
                            '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js',
                        integrity:
                            'sha256-0JaDbGZRXlzkFbV8Xi8ZhH/zZ6QQM0Y3dCkYZ7JYq34=',
                        crossorigin: 'anonymous',
                    },
                    {
                        src: `${linz.get(
                            'admin path'
                        )}/public/js/jquery.binddata.js`,
                    },
                    {
                        src: `${linz.get(
                            'admin path'
                        )}/public/js/documentarray.js?v1`,
                    },
                    {
                        src: `${linz.get(
                            'admin path'
                        )}/public/js/model/edit.js`,
                    },
                ]),
                linz.api.views.getStyles(req, res),
            ])
                .then(([scripts, styles]) => {
                    return res.render(
                        linz.api.views.viewPath('configEdit.jade'),
                        {
                            actionUrl: linz.api.url.getAdminLink(
                                req.linz.config,
                                'save',
                                req.linz.record._id
                            ),
                            cancelUrl: linz.api.url.getAdminLink(
                                req.linz.config,
                                'list'
                            ),
                            csrfToken: req.csrfToken(),
                            form: editForm.render(),
                            record: req.linz.record,
                            scripts,
                            styles,
                        }
                    );
                })
                .catch(next);
        }
    );
};

module.exports = route;

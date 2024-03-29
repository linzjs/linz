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
                    linz.get('requiredScripts')['handlebars.min.js'],
                    {
                        src: `${linz.get(
                            'admin path'
                        )}/public/js/jquery.binddata.js?v1`,
                    },
                    {
                        src: `${linz.get(
                            'admin path'
                        )}/public/js/documentarray.js?v3`,
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
                        linz.api.views.viewPath('configEdit.pug'),
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

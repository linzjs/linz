'use strict';

const inflection = require('inflection');
const linz = require('../');

/* GET /admin/model/:model/create */
var route = function(req, res, next) {
    linz.api.model
        .generateForm(req.linz.model, {
            record: {},
            req,
            type: 'create',
        })
        .then((editForm) => {
            const data = {};

            (function(cb) {
                linz.api.views.renderNotifications(
                    req,
                    (err, notificationHtml) => {
                        if (err) {
                            return cb(err);
                        }

                        if (notificationHtml) {
                            data.notifications = notificationHtml;
                        }

                        return cb();
                    }
                );
            })(function() {
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
                        const singular = inflection.humanize(
                            req.linz.model.linz.formtools.model.label,
                            true
                        );

                        return res.render(
                            linz.api.views.viewPath('modelCreate.jade'),
                            Object.assign(data, {
                                actionUrl: linz.api.url.getAdminLink(
                                    req.linz.model,
                                    'create'
                                ),
                                cancelUrl: linz.api.url.getAdminLink(
                                    req.linz.model
                                ),
                                csrfToken: req.csrfToken(),
                                form: editForm.render(),
                                label: {
                                    singular,
                                    plural:
                                        req.linz.model.linz.formtools.model
                                            .plural,
                                },
                                model: req.linz.model,
                                pageTitle: `Create a new ${singular}`,
                                scripts,
                                styles,
                                view: 'model-create',
                            })
                        );
                    })
                    .catch(next);
            });
        })
        .catch(next);
};

module.exports = route;

'use strict';

const inflection = require('inflection');
const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

/* GET /admin/model/:model/create */
var route = function (req, res, next) {

    linz.formtools.form.generateFormFromModel(req.linz.model.schema, req.linz.model.linz.formtools.form, {}, 'create', function (err, editForm) {

        if (err) {
            return next(err);
        }

        Promise.all([
            setTemplateScripts(req, res),
            setTemplateStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('modelCreate.jade'), {
                    actionUrl: linz.api.url.getAdminLink(req.linz.model, 'create'),
                    cancelUrl: linz.api.url.getAdminLink(req.linz.model),
                    form: editForm.render(),
                    label: {
                        singular: inflection.humanize(req.linz.model.linz.formtools.model.label, true),
                        plural: req.linz.model.linz.formtools.model.plural,
                    },
                    model: req.linz.model,
                    scripts,
                    styles,
                });

            })
            .catch(next);

    });

};

module.exports = route;

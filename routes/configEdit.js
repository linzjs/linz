'use strict';

const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

/* GET /admin/config/:config/overview */
var route = function (req, res, next) {

    linz.formtools.form.generateFormFromModel(req.linz.config.schema, req.linz.config.linz.formtools.form, req.linz.record, 'edit', function (err, editForm) {

        if (err) {
            return next(err);
        }

        Promise.all([
            setTemplateScripts(req, res),
            setTemplateStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('configEdit.jade'), {
                    actionUrl: linz.api.url.getAdminLink(req.linz.config, 'save', req.linz.record._id),
                    cancelUrl: linz.api.url.getAdminLink(req.linz.config, 'list'),
                    form: editForm.render(),
                    record: req.linz.record,
                    scripts,
                    styles,
                });

            })
            .catch(next);

    });

};

module.exports = route;

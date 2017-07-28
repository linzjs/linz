var linz = require('../'),
    inflection = require('inflection');

/* GET /admin/model/:model/create */
var route = function (req, res, next) {

    linz.formtools.form.generateFormFromModel(req.linz.model.schema, req.linz.model.linz.formtools.form, {}, 'create', function (err, editForm) {

        if (err) {
            return next(err);
        }

        res.render(linz.api.views.viewPath('modelCreate.jade'), {
            actionUrl: linz.api.url.getAdminLink(req.linz.model, 'create'),
            cancelUrl: linz.api.url.getAdminLink(req.linz.model),
            form: editForm.render(),
            label: {
                singular: inflection.humanize(req.linz.model.linz.formtools.model.label, true),
                plural: req.linz.model.linz.formtools.model.plural,
            },
            model: req.linz.model,
            scripts: res.locals.scripts,
            styles: res.locals.styles,
        });

    });

};

module.exports = route;

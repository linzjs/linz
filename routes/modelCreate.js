var linz = require('../'),
    inflection = require('inflection');

/* GET /admin/model/:model/create */
var route = function (req, res, next) {

	linz.formtools.form.generateFormFromModel(req.linz.model.schema, req.linz.model.form, {}, 'create', function (err, editForm) {

        if (err) {
            return next(err);
        }

		res.render(linz.api.views.viewPath('modelCreate.jade'), {
			model: req.linz.model,
			form: editForm.render(),
            actionUrl: linz.api.url.getAdminLink(req.linz.model, 'create'),
            cancelUrl: linz.api.url.getAdminLink(req.linz.model),
            label: {
                singular: inflection.humanize(req.linz.model.linz.formtools.model.label, true),
                plural: req.linz.model.linz.formtools.model.plural
            }
		});

	});

};

module.exports = route;

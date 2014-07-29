var linz = require('../'),
    inflection = require('inflection');

/* GET /admin/model/:model/create */
var route = function (req, res) {

	linz.formtools.form.generateFormFromModel(req.linz.model.schema, req.linz.model.form, {}, 'create', function (editForm) {

		res.render(req.linz.views + '/modelCreate.jade', {
			model: req.linz.model,
			form: editForm.render(),
            actionUrl: linz.api.getAdminLink(req.linz.model, 'create'),
            cancelUrl: linz.api.getAdminLink(req.linz.model),
            label: {
                singular: inflection.humanize(req.linz.model.linz.model.label, true),
                plural: req.linz.model.linz.model.plural
            }
		});

	});

};

module.exports = route;

var formist = require('formist'),
	linz = require('../');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	linz.formtools.form.generateFormFromModel(req.linz.model.schema, req.linz.model.form, req.linz.record, 'edit', function (editForm) {

		res.render(req.linz.views + '/recordEdit.jade', {
			model: req.linz.model,
			record: req.linz.record,
			form: editForm.render(),
            actionUrl: linz.api.getAdminLink(req.linz.model.modelName, 'save', req.linz.record._id),
			cancelUrl: linz.api.getAdminLink(req.linz.model.modelName)
		});

	});

};

module.exports = route;

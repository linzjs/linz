var linz = require('../');

/* GET /admin/model/:model/create */
var route = function (req, res) {

	linz.formtools.form.generateFormFromModel(req.linz.model, {}, 'create', function (editForm) {

		res.render(req.linz.views + '/modelCreate.jade', {
			model: req.linz.model,
			form: editForm.render(),
            actionUrl: linz.api.getAdminLink(req.linz.model.modelName, 'create'),
            cancelUrl: linz.api.getAdminLink(req.linz.model.modelName)
		});

	});

};

module.exports = route;

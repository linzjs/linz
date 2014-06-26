var linz = require('../');

/* GET /admin/config/:config/overview */
var route = function (req, res) {

	linz.formtools.form.generateFormFromModel(req.linz.config.schema, req.linz.config.form, req.linz.record, 'edit', function (editForm) {

		res.render(linz.views + '/configEdit.jade', {
			record: req.linz.record,
			form: editForm.render(),
            actionUrl: linz.api.getAdminLink(req.linz.config, 'save', req.linz.record._id),
			cancelUrl: linz.api.getAdminLink(req.linz.config, 'list')
		});

	});

};

module.exports = route;

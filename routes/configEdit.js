/* GET /admin/config/:config/overview */
var route = function (req, res) {

	req.linz.formtools.form.generateFormFromModel(req.linz.config.schema, req.linz.config.form, req.linz.record, 'edit', function (editForm) {

		res.render(req.linz.views + '/configEdit.jade', {
			record: req.linz.record,
			form: editForm.render(),
            actionUrl: req.linz.api.getAdminLink(req.linz.config, 'save', req.linz.record._id),
			cancelUrl: req.linz.api.getAdminLink(req.linz.config, 'list')
		});

	});

};

module.exports = route;

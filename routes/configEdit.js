var linz = require('../');

/* GET /admin/config/:config/overview */
var route = function (req, res, next) {

	linz.formtools.form.generateFormFromModel(req.linz.config.schema, req.linz.config.form, req.linz.record, 'edit', function (err, editForm) {

		if (err) {
			return next(err);
		}

		res.render(linz.api.views.viewPath('configEdit.jade'), {
			record: req.linz.record,
			form: editForm.render(),
            actionUrl: linz.api.url.getAdminLink(req.linz.config, 'save', req.linz.record._id),
			cancelUrl: linz.api.url.getAdminLink(req.linz.config, 'list')
		});

	});

};

module.exports = route;

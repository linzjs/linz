var forms = require('forms'),
	fields = forms.fields,
	validators = forms.validtors,
	widgets = forms.widgets,
	formtools = require('../lib/formtools');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	formtools.form.generateFormFromModel(req.linz.model, req.linz.record, 'edit', function (editForm) {

		res.render(req.linz.views + '/recordEdit.jade', {
			model: req.linz.model,
			record: req.linz.record,
			form: editForm.toHTML(function (name, object) {
				return formtools.form.bootstrapField(name, object);
			}),
			cancelLink: req.linz.get('admin path') + '/model/' + req.linz.model.modelName + '/list'
		});

	});

};

module.exports = route;

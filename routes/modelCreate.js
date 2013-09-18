var forms = require('forms'),
	fields = forms.fields,
	validators = forms.validtors,
	widgets = forms.widgets,
	helpers = require('../lib/helpers-form');

/* GET /admin/model/:model/create */
var route = function (req, res) {

	var editForm = helpers.generateFormFromModel(req.linz.model, {});

	res.render(req.linz.views + '/modelCreate.jade', {
		model: req.linz.model,
		form: editForm.toHTML(function (name, object) {
			return helpers.bootstrapField(name, object);
		}),
		cancelLink: req.linz.options.adminPath + '/model/' + req.linz.model.modelName + '/list'
	});

};

module.exports = route;
var forms = require('forms'),
	fields = forms.fields,
	validators = forms.validtors,
	widgets = forms.widgets,
	helpers = require('../lib/helpers-form');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	editForm = helpers.generateFormFromModel(req.linz.model, req.linz.record);

	res.render(req.linz.views + '/recordEdit.jade', {
		model: req.linz.model,
		record: req.linz.record,
		form: editForm.toHTML(function (name, object) {
			return bootstrapField(name, object);
		}),
		cancelLink: req.linz.options.adminPath + '/model/' + req.linz.model.modelName + '/list'
	});

};

function bootstrapField (name, object) {

	var label = object.labelHTML(name);
	var error = object.error ? '<p class="form-error-tooltip">' + object.error + '</p>' : '' ;
	var widget = '<div class="col-lg-10">' + object.widget.toHTML(name, object) + error + '</div>';

	return '<div class="form-group ' + (error !== '' ? 'has-error':'') + '">' + label + widget + '</div>';

}

module.exports = route;
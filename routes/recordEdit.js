var forms = require('forms'),
	fields = forms.fields,
	validators = forms.validtors,
	widgets = forms.widgets,
	helpers = require('../lib/helpers-form');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	// create an object of fields we want to edit
	var fds = {};
	var m = req.linz.model;
	var r = req.linz.record;

	Object.keys(m.schema.paths).forEach(function (fieldName) {

		if (fieldName !== '_id' && fieldName !== '__v') {

			var field = m.schema.paths[fieldName];
			var schemaType = helpers.findFieldType(field);
			var formField;
			var choices;

			if (Array.isArray(field.enumValues) && field.enumValues.length) {

				// add the options to the choices object to be passed to the select box
				schemaType = 'Enum';
				choices = {};

				field.enumValues.forEach(function (val) {
					choices[val] = val;
				});

			}

			switch (schemaType) {

				case 'Enum':
				formField = fields.string({
								widget: widgets.select({
									classes: ['form-control']
								}),
								cssClasses: {
									label: ['col-lg-2 control-label']
								},
								value: r[fieldName],
								choices: choices
							});
				break;

				case 'String':
				formField = fields.string({
								widget: widgets.text({
									classes: ['form-control']
								}),
								value: r[fieldName],
								cssClasses: {
									label: ['col-lg-2 control-label']
								}
							});
				break;

				case 'Date':
				formField = fields.date({
								widget: widgets.date({
									classes: ['form-control']
								}),
								value: r[fieldName],
								cssClasses: {
									label: ['col-lg-2 control-label']
								}
							});
				break;

				case 'Text':
				formField = fields.string({
								widget: widgets.textarea({
									classes: ['form-control'],
									rows: '6'
								}),
								value: r[fieldName],
								cssClasses: {
									label: ['col-lg-2 control-label']
								}
							});
				break;

				case 'Number':
				formField = fields.number({
								widget: widgets.text({
									classes: ['form-control']
								}),
								value: r[fieldName],
								cssClasses: {
									label: ['col-lg-2 control-label']
								}
							});
				break;

				case 'Oid':
				formField = fields.string({
								widget: widgets.text({
									classes: ['form-control']
								}),
								value: r[fieldName],
								cssClasses: {
									label: ['col-lg-2 control-label']
								}
							});
				break;

			}

			fds[field.path] = formField;

		}

	});

	var editForm = forms.create(fds);

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
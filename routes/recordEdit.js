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

			switch (schemaType) {

				case 'String':
				fds[field.path] = fields.string({
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
				fds[field.path] = fields.date({
									widget: widgets.text({
										classes: ['form-control']
									}),
									value: r[fieldName],
									cssClasses: {
										label: ['col-lg-2 control-label']
									}
								});
				break;

				case 'Text':
				fds[field.path] = fields.string({
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
				fds[field.path] = fields.number({
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
				fds[field.path] = fields.string({
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
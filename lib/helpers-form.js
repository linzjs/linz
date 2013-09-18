var mongoose = require.main.require('mongoose'),
	types = mongoose.Schema.Types,
	forms = require('forms'),
	fields = forms.fields,
	widgets = forms.widgets,
	validators = forms.validators;

var findFieldType = exports.findFieldType = function (field) {

	var type;

	// loop through all of the mongoose Schema Types and find a match for the current field
	// we're going in reverse because mongoose Schema Types are inherited
	// and the inherited ones are on the end of the list, and we want the extended types
	Object.keys(types).reverse().some(function (element, index, array) {

		// if this field matches the mongoose Schema Type
		// stop the loop (by returning true) and set the value of type
		if (field instanceof types[element]) {
			type = element;
			return true;
		}

		return false;

	});

	return type;

};

var generateFormFromModel = exports.generateFormFromModel = function (m, r) {

	var formFields = {};

	Object.keys(m.schema.paths).forEach(function (fieldName) {

		if (fieldName !== '_id' && fieldName !== '__v') {

			var field = m.schema.paths[fieldName];
			var schemaType = findFieldType(field);
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

			formFields[field.path] = formField;

		}

	});

	return forms.create(formFields);

};
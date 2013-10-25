var mongoose = require.main.require('mongoose'),
	types = mongoose.Schema.Types,
	forms = require('forms'),
	fields = forms.fields,
	widgets = forms.widgets,
	validators = forms.validators,
	async = require('async');

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

var generateFormFromModel = exports.generateFormFromModel = function (m, r, cb) {

	var formFields = {};

	async.eachSeries(Object.keys(m.schema.paths), function (fieldName, fn) {

		if (fieldName !== '_id' && fieldName !== '__v') {

			var field = m.schema.paths[fieldName];
			var schemaType = findFieldType(field);
			var formField;
			var choices;
			var defaultValue = null;

			// determine if the field has enumValues
			if (Array.isArray(field.enumValues) && field.enumValues.length) {

				// add the options to the choices object to be passed to the select box
				schemaType = 'Enum';
				choices = {};

				field.enumValues.forEach(function (val) {
					choices[val] = val;
				});

			}

			if (field.defaultValue !== undefined) {

				// work out the default value and use it
				if (typeof field.defaultValue !== 'function') {
					defaultValue = field.defaultValue;
				} else if (typeof field.defaultValue === 'function') {
					defaultValue = field.defaultValue();
				}

			}

			async.series([
				function (callback) {

					// if the field has a reference, we need to grab the values for that type and add them in
					if (field.options.ref) {

						mongoose.models[field.options.ref].find({}, function (err, docs) {

							schemaType = 'Enum';
							choices = {};

							docs.forEach(function (doc) {
								choices[doc._id.toString()] = doc.title || doc.label || doc.name || doc.toString();
							});

							callback(null);

						});

					} else {

						callback(null);

					}

				},
				function (callback) {

					switch (schemaType) {

						case 'Enum':
						formField = fields.string({
										widget: widgets.select({
											classes: ['form-control']
										}),
										cssClasses: {
											label: ['col-lg-2 control-label']
										},
										// need to use toString so that forms module matching (===) works, was erroring on numbers
										value: (r[fieldName] != null ? r[fieldName].toString() : null) || (defaultValue != null ? defaultValue.toString() : defaultValue),
										choices: choices
									});
						break;

						case 'String':
						formField = fields.string({
										widget: widgets.text({
											classes: ['form-control']
										}),
										value: (r[fieldName] != null ? r[fieldName].toString() : null) || (defaultValue != null ? defaultValue.toString() : defaultValue),
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
										value: (r[fieldName] != null ? r[fieldName].toString() : null) || defaultValue,
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
										value: (r[fieldName] != null ? r[fieldName].toString() : null) || (defaultValue != null ? defaultValue.toString() : defaultValue),
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
										// need to use toString() so that 0 doesn't eval to falsy
										value: (r[fieldName] != null ? r[fieldName].toString() : null) || (defaultValue != null ? defaultValue.toString() : defaultValue),
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
										value: (r[fieldName] != null ? r[fieldName].toString() : null) || (defaultValue != null ? defaultValue.toString() : defaultValue),
										cssClasses: {
											label: ['col-lg-2 control-label']
										}
									});
						break;

					}

					formFields[field.path] = formField;
					
					callback(null);

				}
			], function (err, results) {

				fn(null);

			});

		} else {

			fn(null);

		}

	}, function (err) {

		cb(forms.create(formFields));

	});

};

var bootstrapField = exports.bootstrapField = function (name, object) {

	var label = object.labelHTML(name);
	var error = object.error ? '<p class="form-error-tooltip">' + object.error + '</p>' : '' ;
	var widget = '<div class="col-lg-10">' + object.widget.toHTML(name, object) + error + '</div>';

	return '<div class="form-group ' + (error !== '' ? 'has-error':'') + '">' + label + widget + '</div>';

}
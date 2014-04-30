var linz = require('../'),
	forms = require('forms'),
	fields = forms.fields,
	widgets = forms.widgets,
	validators = forms.validators,
	async = require('async'),
	util = require('util');

var findFieldType = exports.findFieldType = function (field) {

	var types = linz.mongoose.Schema.Types,
		type;

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

var padWithZero = function (val) {
	return String(val).length < 2 ? '0' + String(val) : val;
};

var generateFormFromModel = exports.generateFormFromModel = function (m, r, cb) {

	var formFields = {};

	async.eachSeries(Object.keys(m.schema.paths), function (fieldName, fn) {

		if (fieldName !== '_id' && fieldName !== '__v') {

			var field = m.schema.paths[fieldName];
			var fieldOptions = field.options;
			var schemaType = findFieldType(field);
			var formField;
			var choices;
			var defaultValue = null;

			// determine if the field has enumValues
			if (Array.isArray(field.options.enum) && field.options.enum.length) {

				// add the options to the choices object to be passed to the select box
				if (schemaType !== 'Array') schemaType = 'Enum';
				choices = {};

				field.options.enum.forEach(function (val) {
					choices[val] = val;
				});

			}

			if (field.defaultValue !== undefined && schemaType !== 'Array') {

				// work out the default value and use it
				if (typeof field.defaultValue !== 'function') {
					defaultValue = field.defaultValue;
				} else if (typeof field.defaultValue === 'function') {
					defaultValue = field.defaultValue();
				}

			} else if (field.defaultValue === undefined && schemaType === 'Datetime') {

				field.defaultValue = function () {

					var d = new Date();
					return d.getFullYear() + '-' +
							padWithZero(d.getMonth()+1) + '-' +
							padWithZero(d.getDate()) + 'T' +
							padWithZero(d.getHours()) + ':' +
							padWithZero(d.getMinutes()) + ':' +
							'00.000';
				};

				defaultValue = field.defaultValue();

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

					if (fieldOptions.visible === false) return callback(null);

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
										value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
										choices: choices
									});
						break;

						case 'String':
						formField = fields.string({
										widget: widgets.text({
											classes: ['form-control']
										}),
										value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
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
										value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || defaultValue,
										cssClasses: {
											label: ['col-lg-2 control-label']
										}
									});
						break;

						case 'Datetime':
						formField = fields.date({
										widget: widgets.datetimeLocal({
											classes: ['form-control']
										}),
										value: (r[fieldName] !== undefined ? r[fieldName].toISOString().slice(0,23) : defaultValue) || defaultValue,
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
										value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
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
										value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
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
										value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
										cssClasses: {
											label: ['col-lg-2 control-label']
										}
									});
						break;

						case 'Bool':
						formField = fields.boolean({
										widget: widgets.checkbox({
											// classes: ['checkbox']
										}),
										value: defaultValue,
										cssClasses: {
											label: ['col-lg-2 control-label']
										}
									});
						break;

						case 'Array':
						formField = fields.array({
										widget: widgets.multipleSelect({
											classes: ['form-control']
										}),
										value: r[fieldName],
										cssClasses: {
											label: ['col-lg-2 control-label']
										},
										choices: choices
									});
						break;

						case 'Password':
						formField = fields.password({
										widget: widgets.password({
											classes: ['form-control']
										}),
										value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
										cssClasses: {
											label: ['col-lg-2 control-label']
										}
									});
						break;

						default:
						formField = fields.string({
										widget: widgets.text({
											classes: ['form-control']
										}),
										value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
										cssClasses: {
											label: ['col-lg-2 control-label']
										}
									});
						break;

					}

					if (schemaType === 'Password') {
						console.log('>>>> Password');
						console.log(r);
						console.log(fieldName);
						console.log(r[fieldName]);
					}

					// add the label if it's been defined on the fieldLabels property passed into the plugin
					if (m.fieldLabels[fieldName]) {
						formField.label = m.fieldLabels[fieldName];
					}

					// override the above, and add the label if it's been defined against the property
					if (fieldOptions.label) {
						formField.label = fieldOptions.label;
					}

					// add the field to the list of fields
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

	var widget;
	var label = object.labelHTML(name);
	var error = object.error ? '<p class="form-error-tooltip">' + object.error + '</p>' : '' ;

	if (object.widget.type === 'checkbox') {
		widget = '<div class="col-lg-10"><div class="checkbox">' + object.widget.toHTML(name, object) + '</div>' + error + '</div>';
	} else {
		widget = '<div class="col-lg-10">' + object.widget.toHTML(name, object) + error + '</div>';
	}

	return '<div class="form-group ' + (error !== '' ? 'has-error':'') + '">' + label + widget + '</div>';

};

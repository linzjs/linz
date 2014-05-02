var linz = require('../../'),
	cellRenderers = require('./renderers-cell');

// ensure we have the neccessary defaults
var defaults = function (options) {

	options = options || {};

	// defaults to {}
	options.grid = options.grid || {};

	// defaults to []
	options.grid.actions = options.grid.actions || [];

	// defaults to true
	options.grid.canEdit = !(options.grid.canEdit === false);

	// defaults to true
	options.grid.canDelete = !(options.grid.canDelete === false);

	// defaults to true
	options.grid.canCreate = !(options.grid.canCreate === false);

	// defaults to true
	options.grid.showSummary = !(options.grid.showSummary === false);

	// defaults to []
	options.grid.sortBy = options.grid.sortBy || ['dateModified'];

	// define a default set of columns
	options.grid.columns = columnsDefaults(options.grid.columns) || {
		title: {
			label: 'Label',
			renderer: cellRenderers.linkRenderer
		},
		status: {
			label: 'Status',
			renderer: cellRenderers.stringRenderer
		},
		publishDate: {
			label: 'Publish date',
			renderer: cellRenderers.dateRenderer
		},
		dateCreated: {
			label: 'Date created',
			renderer: cellRenderers.dateRenderer
		}
	};

    // defaults to {}
    options.form = options.form || {};
    // dateCreated and dateModified will be hidden by default
    options.form.dateCreated = { label: 'Date created', visible: false };
    options.form.dateModified = { label: 'Date modified', visible: false };

	// setup modelActions to an emptry array as default
	options.modelActions = options.modelActions || [];

	// setup fieldLabels to an empty array as default
	options.fieldLabels = options.fieldLabels || {};

	// determine if we need publishing rules
	options.usePublishingDate = (options.usePublishingDate === undefined) ? true : options.usePublishingDate;

	// determine if we want draft/live rules
	options.usePublishingStatus = (options.usePublishingStatus === undefined) ? true : options.usePublishingStatus;

	return options;

};

// a function ensure the columns object has the properties we're expecting
var columnsDefaults = function (columns) {

	// if it's undefined, don't do anything, return an undefined value
	// and the || operator in defaults will set a value
	if (columns === undefined) return columns;

	// loop through the columns and make sure they have the correct setup, i.e. label & renderer
	Object.keys(columns).forEach(function (column) {

		// match a simple string, i.e. Label
		if (typeof columns[column] === 'string') {

			columns[column] = {
				label: columns[column],
				renderer: cellRenderers.defaultRenderer
			};

		// match an object, without a renderer, i.e. { label: 'Label' }
		} else if (typeof columns[column] === 'object' && !columns[column].renderer) {

			columns[column].renderer = cellRenderers.defaultRenderer;

		}

	});

	return columns;

};

var formSettings = function(schema,options){

    // convert schema to form configs DSL
    var formConfigs = convertSchemaToFormConfig(schema);
    var schemaConfig, formConfig;

    // loop throught configs created from schema and add in additional fields from plugin form configs
    for (var key in formConfigs){
        schemaConfig = formConfigs[key] || {};
        formConfig = options.form[key] || {};
        formConfigs[key] = formConfigDefault(key,schemaConfig,formConfig);
    }

    options.form = formConfigs;
    return options.form;
};

var formConfigDefault = function(keyName,schemaConfig,formConfig){

    var obj = {
        label: formConfig.label || keyName || '',
        placeholder: formConfig.placeholder,
        helpText: formConfig.helpText,
        type: formConfig.type || schemaConfig.type || 'string',
        default: formConfig.default || schemaConfig.default,
        list: formConfig.list,
        visible: !(formConfig.visible === false), // defaults to true
        disabled: formConfig.disabled || false
    };

    // fix ReferenceError for accessing properties of undefined object
    if(!formConfig.create) formConfig.create = {};
    if(!formConfig.edit) formConfig.edit = {};

    obj.create = {};
    obj.create.label = formConfig.create.label || obj.label;
    obj.create.visible = formConfig.create.visible || obj.visible;
    obj.create.disabled = formConfig.create.disabled || obj.disabled;

    obj.edit = {};
    obj.edit.label = formConfig.edit.label || obj.label;
    obj.edit.visible = formConfig.create.visible || obj.visible;
    obj.edit.disabled = formConfig.edit.disabled || obj.disabled;

    return obj;

}

var getMongooseSchemaType = function(key){

    // extract the function name from schema type.
    // e.g. this will extract the value 'String' from this example 'function String() { [native code] }'
    var regex = /function ([A-Za-z]*)?/;
    // default to 'string' if none is found
    return key.options.type.toString().match(regex)[1].toLowerCase() || 'string';

}

var convertSchemaToFormConfig = function(schema){

    var formConfig = {};

    for(var key in schema.paths){

        if(key !== '_id' && key !== '__v') {
            formConfig[key] = {
                type: getMongooseSchemaType(schema.paths[key]),
                default: schema.paths[key].defaultValue
            };
        }

    }

    return formConfig;

}

var plugin = module.exports = function formtoolsPlugin (schema, options) {

	options = defaults(options);

	var types = linz.mongoose.Schema.Types;

	// if title already exists, don't add a virtual for it
	if (!schema.paths.title) {

		// set a virtual for title
		schema.virtual('title').get(function () {

			if (typeof this.toLabel === 'function') return this.toLabel();
			if (schema.paths.label && this.label) return this.label;
			if (schema.paths.name && this.name) return this.name;
			if (typeof this.toString === 'function') return this.toString();

			return this;

		});

	}

	// add the mandatory date created, date modified fields
	schema.add({
		dateModified: {
			type: types.Datetime
		},
		dateCreated: {
			type: Date,
			default: Date.now
		}
	});

	// do we need publishing date?
	if (options.usePublishingDate) {
		schema.add({
			publishDate: {
				type: types.Datetime,
				label: 'Publish date'
			}
		});
	}

	// do we need publishing status?
	if (options.usePublishingStatus) {
		schema.add({
			status: {
				type: types.String,
				enum: ['draft', 'approved']
			}
		});
	}

	schema.pre('save', function (next) {
		this.dateModified = new Date();
		next();
	});

	// setup a method to retrieve the column list
	schema.statics.getGrid = function (cb) {

		var sortBy = [];

		// only run this code once
		if (options.grid.sortBy.length && typeof options.grid.sortBy[0] === 'object') {
			return cb(null, options.grid);
		}

		// update sortBy from ['fieldName','secondFieldName'] to [{label:'Field name', field:'fieldName'}]
		for (var sort in options.grid.sortBy) {

			sortBy.push({
				label: (options.fieldLabels[options.grid.sortBy[sort]] || options.grid.sortBy[sort]),
				field: options.grid.sortBy[sort]
			});

		}

		options.grid.sortBy = sortBy;

		return cb(null, options.grid);

	};

    schema.statics.getForm = function(cb){
        cb(null,formSettings(schema,options));
    };

	// setup a method to retrieve the column list
	schema.statics.getFieldLabels = function (cb) {
		cb(null, options.fieldLabels);
	};

	// setup a method to retreive the model actions
	schema.statics.getModelActions = function (cb) {
		cb(null, options.modelActions);
	};

	// is there a custom overview?
	if (options.overview) {
		schema.statics.overview = options.overview;
	}

};

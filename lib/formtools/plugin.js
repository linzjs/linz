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

    options.form = options.form || {};
    // dateCreated and dateModified will be hidden by default
    options.form.dateCreated = { label: 'Date created', visible: false };
    options.form.dateModified = { label: 'Date modified', visible: false };

    // set up fields to an empty object as default
    options.fields = options.fields || {};

	// defaults to true
	options.fields.usePublishingDate = !(options.fields.usePublishingDate === false);
    options.fields.usePublishingStatus = !(options.fields.usePublishingStatus === false);

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
        disabled: (formConfig.disabled === true), // defaults to false
        fieldset: formConfig.fieldset // defaults to undefined
    };

    // fix ReferenceError for accessing properties of undefined object
    if(!formConfig.create) formConfig.create = {};
    if(!formConfig.edit) formConfig.edit = {};

    obj.create = {};
    obj.create.label = formConfig.create.label || obj.label;
    obj.create.visible = (formConfig.create.visible === undefined) ? obj.visible : formConfig.create.visible;
    obj.create.disabled = (formConfig.create.disabled === undefined) ? obj.disabled : formConfig.create.disabled;
    obj.create.fieldset = formConfig.create.fieldset || formConfig.fieldset;

    obj.edit = {};
    obj.edit.label = formConfig.edit.label || obj.label;
    obj.edit.visible = (formConfig.edit.visible === undefined) ? obj.visible : formConfig.edit.visible;
    obj.edit.disabled = (formConfig.edit.disabled === undefined) ? obj.disabled : formConfig.edit.disabled;
    obj.edit.fieldset = formConfig.edit.fieldset || formConfig.fieldset;

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

	var types = linz.mongoose.Schema.Types,
        sortBy = [],
        form;

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
	if (options.fields.usePublishingDate) {
		schema.add({
			publishDate: {
				type: types.Datetime,
				label: 'Publish date'
			}
		});
	}

	// do we need publishing status?
	if (options.fields.usePublishingStatus) {
		schema.add({
			status: {
				type: String,
				enum: ['draft', 'approved']
			}
		});
	}

    // load form settings
    form = formSettings(schema,options);

    // update sortBy from ['fieldName','secondFieldName'] to [{label:'Field name', field:'fieldName'}]
    for (var sort in options.grid.sortBy) {

        sortBy.push({
            label: (options.form[options.grid.sortBy[sort]].label || options.grid.sortBy[sort]),
            field: options.grid.sortBy[sort]
        });

    }

	schema.pre('save', function (next) {
		this.dateModified = new Date();
		next();
	});

	// setup a method to retrieve the column list
	schema.statics.getGrid = function (cb) {

		options.grid.sortBy = sortBy;
		return cb(null, options.grid);

	};

    schema.statics.getForm = function(cb){

        return cb(null, form);

    };

	// is there a custom overview?
	if (options.overview) {
		schema.statics.overview = options.overview;
	}

};

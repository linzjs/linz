var linz = require('../../');

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
			renderer: linz.formtools.cellRenderers.overviewLink
		},
		status: {
			label: 'Status',
			renderer: linz.formtools.cellRenderers.default
		},
		publishDate: {
			label: 'Publish date',
			renderer: linz.formtools.cellRenderers.date
		},
		dateCreated: {
			label: 'Date created',
			renderer: linz.formtools.cellRenderers.date
		}
	};

    options.grid.filters = filtersDefault(options.grid.filters) || {};

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
				label: columns[column]
			};

		}

        if (columns[column].virtual && !columns[column].renderer) {

            throw new Error('Renderer attribute is missing for virtual column options.grid.columns.' + column);

        }

        if ((column === 'title' || column === 'label') && !columns[column].renderer) {

            columns[column].renderer = linz.formtools.cellRenderers.overviewLink;

        } else {

            // default the renderer
            columns[column].renderer = columns[column].renderer || linz.formtools.cellRenderers.default;

        }

	});

	return columns;

};

// a function ensure the columns object has the properties we're expecting
var filtersDefault = function (filters) {

    // if it's undefined, don't do anything, return an undefined value
    // and the || operator in defaults will set a value
    if (filters === undefined) {
        return filters;
    }

    // loop through the filters and make sure they have the correct setup, i.e. label & filter
    Object.keys(filters).forEach(function (key) {

        // match a simple string, i.e. Label
        if (typeof filters[key] === 'string') {

            filters[key] = {
                label: filters[key]
            };

        }

        // default to key name if label is not provided in the object
        filters[key].label = filters[key].label || key;

        // default the filter if none provided
        filters[key].filter = filters[key].filter || linz.formtools.filters.default;

        if (filters[key].filter) {

            if (!filters[key].filter.renderer) {
                throw new Error('Renderer function is missing for options.grid.filters.' + key);
            }

            if (!filters[key].filter.filter) {
                throw new Error('Filter function is missing for options.grid.filters.' + key);
            }

            if (!filters[key].filter.bind) {
                throw new Error('Bind function is missing for options.grid.filters.' + key);
            }

        }

    });

    return filters;

}

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

    var sortedFormConfigs = {};
    // sort form configs in the order specified in options.form
    for (var i in options.form) {
        sortedFormConfigs[i] = formConfigs[i];
    }

    // add in any missing keys not defined in options.form
    for (var i in formConfigs) {
        if (!sortedFormConfigs[i]) {
            sortedFormConfigs[i] = formConfigs[i];
        }
    }

    options.form = sortedFormConfigs;
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
        fieldset: formConfig.fieldset, // defaults to undefined
        widget: formConfig.widget, // defaults to undefined
        required: (formConfig.required === true), // defaults to false
        query: formConfig.query || {}
    };

    // default the required properties for query
    obj.query.filter = obj.query.filter || undefined;
    obj.query.sort = obj.query.sort || undefined;
    obj.query.select = obj.query.select || undefined;
    obj.query.label = obj.query.label || undefined;

    // fix ReferenceError for accessing properties of undefined object
    if(!formConfig.create) formConfig.create = {};
    if(!formConfig.edit) formConfig.edit = {};

    obj.create = {};
    obj.create.label = formConfig.create.label || obj.label;
    obj.create.visible = (formConfig.create.visible === undefined) ? obj.visible : formConfig.create.visible;
    obj.create.disabled = (formConfig.create.disabled === undefined) ? obj.disabled : formConfig.create.disabled;
    obj.create.fieldset = formConfig.create.fieldset || formConfig.fieldset;
    obj.create.widget = formConfig.create.widget || formConfig.widget;
    obj.create.required = (formConfig.create.required === undefined) ? obj.required : formConfig.create.required;
    obj.create.placeholder = formConfig.create.placeholder || formConfig.placeholder;
    obj.create.query = formConfig.create.query || {};

    // default the required properties for query
    obj.create.query.filter = obj.create.query.filter || obj.query.filter || undefined;
    obj.create.query.sort = obj.create.query.sort || obj.query.sort || undefined;
    obj.create.query.select = obj.create.query.select || obj.query.select || undefined;
    obj.create.query.label = obj.create.query.label || obj.query.label || undefined;

    obj.edit = {};
    obj.edit.label = formConfig.edit.label || obj.label;
    obj.edit.visible = (formConfig.edit.visible === undefined) ? obj.visible : formConfig.edit.visible;
    obj.edit.disabled = (formConfig.edit.disabled === undefined) ? obj.disabled : formConfig.edit.disabled;
    obj.edit.fieldset = formConfig.edit.fieldset || formConfig.fieldset;
    obj.edit.widget = formConfig.edit.widget || formConfig.widget;
    obj.edit.required = (formConfig.edit.required === undefined) ? obj.required : formConfig.edit.required;
    obj.edit.placeholder = formConfig.edit.placeholder || formConfig.placeholder;
    obj.edit.query = formConfig.edit.query || {};

    // default the required properties for query
    obj.edit.query.filter = obj.edit.query.filter || obj.query.filter || undefined;
    obj.edit.query.sort = obj.edit.query.sort || obj.query.sort || undefined;
    obj.edit.query.select = obj.edit.query.select || obj.query.select || undefined;
    obj.edit.query.label = obj.edit.query.label || obj.query.label || undefined;

    return obj;

}

var getMongooseSchemaType = function(schemaType){

    // extract the function name from schema type
    // this will extra the value String from SchemaString (the names of the functions within mongoose)
    // these always exist and therefore safer than key.options.type which didn't always exist (i.e. array)
    return schemaType.constructor.name.replace(/Schema/gi, '').toLowerCase();

}

var convertSchemaToFormConfig = function(schema){

    var formConfig = {};

    schema.eachPath(function (pathname, schemaType) {

        if (pathname !== '_id') {

            formConfig[pathname] = {
                type: getMongooseSchemaType(schemaType),
                default: schema.paths[pathname].defaultValue
            };

        }

    });

    return formConfig;

}

var setFilter = function(filters, filter) {

    for (var fieldName in filter) {

        if (!filters[fieldName]) {
            filters[fieldName] = [];
        }

        if (Array.isArray(filter[fieldName])) {

            filter[fieldName].forEach(function (obj) {
                filters[fieldName].push(obj);
            });

        } else {
            filters[fieldName].push(filter[fieldName]);
        }

    }

    return filters;

}

var setQuery = function (filters) {

    var query = { $and: [] },
        orQuery,
        orFilter;

    for (var fieldName in filters) {

        if (Array.isArray(filters[fieldName]) && filters[fieldName].length) {

            // since there are multiple filters on the same field, this must be an OR filter
            orQuery = { $or: [] };

            filters[fieldName].forEach(function (obj) {
                orFilter = {};
                orFilter[fieldName] = obj;
                orQuery['$or'].push(orFilter);
            });

            query['$and'].push(orQuery);

        } else {
            query[fieldName] = filters[fieldName];
        }

    }

    return query;
};

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

        if (!options.form[options.grid.sortBy[sort]]) {
            throw new Error ('FormtoolError: options.form.' + options.grid.sortBy[sort] + ' is undefined');
        }

        sortBy.push({
            label: (options.form[options.grid.sortBy[sort]].label || options.grid.sortBy[sort]),
            field: options.grid.sortBy[sort]
        });

    }

	schema.pre('save', function (next, req, callback) {

		this.dateModified = new Date();

		return next(callback, req);

	});

	// setup a method to retrieve the column list
	schema.statics.getGrid = function (cb) {

		options.grid.sortBy = sortBy;
		return cb(null, options.grid);

	};

    schema.statics.getForm = function(cb){

        return cb(null, form);

    };

    schema.statics.addSearchFilter = function(filters, filter){

        return setFilter(filters, filter);

    };

    schema.statics.setFiltersAsQuery = function (filters) {

        return setQuery(filters);

    };

	// is there a custom overview?
	if (options.overview) {
		schema.statics.overview = options.overview;
	}

};

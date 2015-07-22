var utils = require('../utils'),
    inflection = require('inflection'),
    linz = require('../../..');

// ensure we have the neccessary defaults
var defaults = function (options, isEmbeddedDocument) {

    options = options || {};

    /**
    * form defaults
    */

    options.form = options.form || {};

    if (isEmbeddedDocument) {
        return options; // settings below is not required for sub document
    }

    // dateCreated and dateModified will be hidden by default
    options.form.dateCreated = { label: 'Date created', visible: false };
    options.form.dateModified = { label: 'Date modified', visible: false };

    // set up fields to an empty object as default
    options.fields = options.fields || {};

    // defaults to true
    options.fields.usePublishingDate = !(options.fields.usePublishingDate === false);
    options.fields.usePublishingStatus = !(options.fields.usePublishingStatus === false);

    // /**
    // * grid defaults
    // */
    //
    // defaults to {}
    options.grid = options.grid || {};

    // defaults to []
    options.grid.actions = options.grid.actions || [];

    // defaults to []
    options.grid.toolbarItems = options.grid.toolbarItems || [];

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

    options.grid.paging = options.grid.paging || {};

    // defaults to true
    options.grid.paging.active = !(options.grid.paging.active === false);

    // defaults to 20
    options.grid.paging.size = options.grid.paging.size || linz.get('page size');

    // detaults to [20,50,100,200]
    options.grid.paging.sizes = options.grid.paging.sizes || linz.get('page sizes');

    // defaults to []
    options.grid.groupActions = options.grid.groupActions || [];

    // defaults to []
    options.grid.recordActions = options.grid.recordActions || [];

    // defaults to []
    options.grid.export = exportDefault(options.grid.export) || [];

    /**
    * overview defaults
    */

    // defaults to {}
    options.overview = options.overview || {};

    // defaults to []
    options.overview.actions = options.overview.actions || [];

    // defaults to true
    options.overview.canEdit = !(options.overview.canEdit === false);

    // defaults to true
    options.overview.canDelete = !(options.overview.canDelete === false);

    // defaults to true
    options.overview.viewAll = !(options.overview.viewAll === false);

    options.overview.summary = overviewSummaryDefault(options.overview.summary) || {
        fields: {
            dateCreated: {
                label: 'Date created',
                renderer: linz.formtools.cellRenderers.date
            },
            dateModified: {
                label: 'Date modified',
                renderer: linz.formtools.cellRenderers.date
            }
        },
        renderer: linz.formtools.overview.renderer.summary
    }

    options.overview.summary.label = options.overview.summary.label || 'Summary';

    /**
    * Model defaults
    */
    options.model = options.model || {};

    // model registration options (defaults to false)
    options.model.hide = (options.model.hide === true);

    // label defaults to ''
    options.model.label = options.model.label || '';

    // plural defaults to '', or a pluralized version of label
    if (options.model.plural === undefined) {
        options.model.plural = (options.model.label.length > 0) ? inflection.pluralize(options.model.label) : '';
    }

    // description defaults to ''
    options.model.description = options.model.description || '';

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

};

var exportDefault = function (exports) {

    if (!exports) {
        return undefined;
    }

    var validatedExports = [];

    // linz will accept an object, or an array of objects
    if (!Array.isArray(exports)) {
        exports = [exports];
    }

    // loop through each export, and default some values
    exports.forEach(function (exp) {

        // we must have a label, otherwise there is not enough information
        if (!exp.label) {
            return;
        }

        if (exp.action && exp.action === 'export') {
            throw new Error('You can not define a model export with an action property of export, this is reserved for Linz.');
        }

        var expObj = {
                label: exp.label,
                action: exp.action || 'export',
                enabled: !(exp.enable === true),
                permission: exp.permission || undefined,
                exclusions: exp.exclusions || '_id,dateCreated,dateModified,createdBy,modifiedBy'
            };

        // Linz's built in action is called export
        expObj.custom = expObj.action !== 'export';

        // push this into the list of exports
        validatedExports.push(expObj);

    });

    return validatedExports;

};

var overviewSummaryDefault = function (summary) {

    // if it's undefined, don't do anything, return an undefined value
    // and the || operator in defaults will set a value
    if (summary === undefined) {
        return summary;
    }

    if (!summary.fields && !summary.renderer) {
        throw new Error('overview.summary.renderer is required if overview.summary.fields is not defined');
    }

    if (summary.fields && !summary.renderer) {
        summary.renderer = linz.formtools.overview.renderer.summary;
    }

    if (summary.fields) {

        Object.keys(summary.fields).forEach(function (fieldName) {

            if ((fieldName === 'dateModified' || fieldName === 'dateCreated') && !summary.fields[fieldName].renderer) {
                summary.fields[fieldName].renderer = linz.formtools.cellRenderers.date;
            } else {
                // default the renderer
                summary.fields[fieldName].renderer = summary.fields[fieldName].renderer || linz.formtools.cellRenderers.default;
            }

        });

    }

    return summary;
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
        query: formConfig.query || {},
        transform: formConfig.transform, // defaults to undefined,
        schema: schemaConfig.schema, // defaults to undefined
        relationship: formConfig.relationship // defaults to undefined
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
    obj.create.transform = formConfig.create.transform || formConfig.transform;

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
    obj.edit.transform = formConfig.edit.transform || formConfig.transform;

    // default the required properties for query
    obj.edit.query.filter = obj.edit.query.filter || obj.query.filter || undefined;
    obj.edit.query.sort = obj.edit.query.sort || obj.query.sort || undefined;
    obj.edit.query.select = obj.edit.query.select || obj.query.select || undefined;
    obj.edit.query.label = obj.edit.query.label || obj.query.label || undefined;

    return obj;

}

var convertSchemaToFormConfig = function(schema){

    var formConfig = {};

    schema.eachPath(function (pathname, schemaType) {

        if (pathname !== '_id') {

            formConfig[pathname] = {
                type: utils.schemaType(schemaType),
                default: schema.paths[pathname].defaultValue
            };

            if (formConfig[pathname].type === 'documentarray') {
                formConfig[pathname].schema = schema.paths[pathname].schema;
            }

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

var overviewSettings = function (form, overview) {

    // Get fields label, if fields is provided
    if (overview.summary.fields) {
        Object.keys(overview.summary.fields).forEach(function (fieldName) {
            overview.summary.fields[fieldName].label = overview.summary.fields[fieldName].label || form[fieldName].label || fieldName;
        });
    }

    return overview;
}


module.exports = {
    defaults: defaults,
    columnsDefaults: columnsDefaults,
    filtersDefault: filtersDefault,
    overviewSummaryDefault: overviewSummaryDefault,
    formSettings: formSettings,
    formConfigDefault: formConfigDefault,
    convertSchemaToFormConfig: convertSchemaToFormConfig,
    setFilter: setFilter,
    setQuery: setQuery,
    overviewSettings: overviewSettings
};

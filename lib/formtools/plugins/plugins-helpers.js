var utils = require('../utils'),
    inflection = require('inflection'),
    linz = require('../../..');

// ensure we have the neccessary defaults
var defaults = function (options, isEmbeddedDocument) {

    options = options || {};

    /**
     * label defaults
     */
    options.labels = options.labels || {};

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

    /**
     * Permissions defaults
     */
     options.permissions = options.permissions || {};

    return options;

};

var listDefaults = function (list, labels) {

    // defaults to {}
    list = list || {};

    // defaults to []
    list.actions = actionsDefaults(list.actions) || [];

    // defaults to []
    list.toolbarItems = list.toolbarItems || [];

    // defaults to true
    list.showSummary = !(list.showSummary === false);

    list.sortBy = transformSortBy(labels, list.sortBy || ['dateModified']);

    // define a default set of fields
    list.fields = fieldsDefaults(list.fields, labels) || {
        title: {
            label: 'Label',
            renderer: linz.formtools.cellRenderers.overviewLink
        },
        dateCreated: {
            label: 'Date created',
            renderer: linz.formtools.cellRenderers.date
        }
    };

    list.filters = filtersDefault(list.filters, labels) || {};

    list.paging = list.paging || {};

    // defaults to true
    list.paging.active = !(list.paging.active === false);

    // defaults to 20
    list.paging.size = list.paging.size || linz.get('page size');

    // detaults to [20,50,100,200]
    list.paging.sizes = list.paging.sizes || linz.get('page sizes');

    // defaults to []
    list.groupActions = actionsDefaults(list.groupActions) || [];

    // defaults to []
    list.recordActions = actionsDefaults(list.recordActions) || [];

    // defaults to []
    list.footerActions = actionsDefaults(list.footerActions) || [];

    // defaults to []
    list.export = exportDefault(list.export) || [];

    return list;

};

// a function ensure the fields object has the properties we're expecting
var fieldsDefaults = function (fields, labels) {

    // if it's undefined, don't do anything, return an undefined value
    // and the || operator in defaults will set a value
    if (fields === undefined) return fields;

    // loop through the fields and make sure they have the correct setup, i.e. label & renderer
    Object.keys(fields).forEach(function (field) {

        // match a simple string, i.e. Label
        if (typeof fields[field] === 'string') {

            fields[field] = {
                label: fields[field]
            };

        }

        if (typeof fields[field] === 'boolean' && fields[field] === true) {

            // Set the label based on the labels object.
            fields[field] = {
                label: labels[field]
            };

            // If they're requesting the default `title` field, let's add it in.
            if (field === 'title') {

                fields[field] = {
                    label: labels[field] || 'Label',
                    renderer: fields[field].renderer || linz.formtools.cellRenderers.overviewLink
                };

            }

        }

        // make sure the label exists
        if (!fields[field].label) {
            fields[field].label = labels[field];
        }

        if (fields[field].virtual && !fields[field].renderer) {

            throw new Error('Renderer attribute is missing for virtual field options.list.fields.' + field);

        }

        if ((field === 'title' || field === 'label') && !fields[field].renderer) {

            fields[field].renderer = linz.formtools.cellRenderers.overviewLink;

        } else {

            // default the renderer
            fields[field].renderer = fields[field].renderer || linz.formtools.cellRenderers.default;

        }

    });

    return fields;

};

var actionsDefaults = function (actions) {

    // if it's undefined, don't do anything, return an undefined value
    // and the || operator in defaults will set a value
    if (actions === undefined) {
        return actions;
    }

    // only apply this alteration once
    actions.filter(function (action) {
        return action.action.substr(0, 7) !== 'action/';
    }).forEach(function (action) {
        action.action = 'action/' + action.action;
    });

    return actions;

};

var overviewDefaults = function (overview) {

    // defaults to {}
    overview = overview || {};

    // defaults to []
    overview.actions = actionsDefaults(overview.actions) || [];

    // defaults to true
    overview.viewAll = !(overview.viewAll === false);

    // set default for overview body
    overview.body = overview.body || [
        {
            label: 'Summary',
            fields: ['dateCreated', 'dateModified']
        }
    ];

    if (typeof overview.body !== 'function' && !Array.isArray(overview.body)) {
        throw new Error('overview.body in model must be a function or an Array.');
    }

    return overview;

};

// a function ensure the fields object has the properties we're expecting
var filtersDefault = function (filters, labels) {

    // if it's undefined, don't do anything, return an undefined value
    // and the || operator in defaults will set a value
    if (filters === undefined) {
        return filters;
    }

    // loop through the filters and make sure they have the correct setup, i.e. label & filter
    Object.keys(filters).forEach(function (key) {

        // use case: String
        // title: 'Title'
        if (typeof filters[key] === 'string') {

            filters[key] = {
                label: filters[key]
            };

        }

        // use case: Boolean
        // title: true
        if (typeof filters[key] === 'boolean') {

            // returning undefined will allow this and other incomplete forms
            // to all use the same rules as per filters[key].label assignment below.
            filters[key] = {
                label: undefined
            };

        }


        // use label if provided explicitly, otherwise default to key name
        // if label is not provided in the labels object object
        filters[key].label = filters[key].label || labels[key];

        // default the filter if none provided
        filters[key].filter = filters[key].filter || linz.formtools.filters.default;

        if (filters[key].filter) {

            if (!filters[key].filter.renderer) {
                throw new Error('Renderer function is missing for options.list.filters.' + key);
            }

            if (!filters[key].filter.filter) {
                throw new Error('Filter function is missing for options.list.filters.' + key);
            }

            if (!filters[key].filter.bind) {
                throw new Error('Bind function is missing for options.list.filters.' + key);
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

var formSettings = function (schema, form, labels) {

    // convert schema to form configs DSL
    var formConfigs = convertSchemaToFormConfig(schema);
    var schemaConfig, formConfig;

    // loop throught configs created from schema and add in additional fields from plugin form configs
    for (var key in formConfigs){
        schemaConfig = formConfigs[key] || {};
        formConfig = form[key] || {};

        // support for form DSL where "fieldName: true" with no other configurations
        if (formConfig === true) {
            formConfig = {};
        }

        formConfigs[key] = formConfigDefault(key, schemaConfig, formConfig, labels);
    }

    var sortedFormConfigs = {};
    // sort form configs in the order specified in form
    for (var i in form) {
        sortedFormConfigs[i] = formConfigs[i];
    }

    // add in any missing keys not defined in form
    for (var i in formConfigs) {
        if (!sortedFormConfigs[i]) {
            sortedFormConfigs[i] = formConfigs[i];
        }
    }

    form = sortedFormConfigs;
    return form;
};

var formConfigDefault = function (keyName, schemaConfig, formConfig, labels) {

    var obj = {
        label: formConfig.label || labels[keyName],
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
        transform: formConfig.transform, // defaults to undefined
        transpose: formConfig.transpose, // defaults to undefined
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

};

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

};

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

};

var setQuery = function (filters) {

    var query = { $and: [] },
    orQuery,
    orFilter;

    // If we don't have filters, return an empty object.
    if (!Object.keys(filters).length) {
        return {};
    }

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

var transformSortBy = function (labels, sortBy) {

    return sortBy.map(function (fieldName) {

        return {
            label: (labels[fieldName] || fieldName),
            field: fieldName
        };

    });

};

var indexObj = function (fieldName) {

    let i = {};

    i[fieldName] = 1;

    return i;

};

module.exports = {
    defaults: defaults,
    listDefaults: listDefaults,
    fieldsDefaults: fieldsDefaults,
    filtersDefault: filtersDefault,
    formSettings: formSettings,
    formConfigDefault: formConfigDefault,
    convertSchemaToFormConfig: convertSchemaToFormConfig,
    setFilter: setFilter,
    setQuery: setQuery,
    transformSortBy: transformSortBy,
    overviewDefaults: overviewDefaults,
    indexObj: indexObj
};

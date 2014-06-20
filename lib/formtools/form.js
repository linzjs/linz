var linz = require('../../'),
    formist = require('formist'),
	async = require('async'),
    theme = require('./theme'),
    utils = require('../utils'),
    formtoolUtils = require('./utils')
    moment = require('moment');

var addToFormOrFieldset = function (form, fieldsets, fieldsetKey, element) {

    var container = form;

    if (fieldsetKey !== undefined) {

        // create the fieldset if it currently doesn't exist
        if (fieldsets[fieldsetKey] === undefined) {
            fieldsets[fieldsetKey] = form.add(new formist.Fieldset({
                legend: fieldsetKey
            }));
        }

        container = fieldsets[fieldsetKey];

    }

    container.add(element);

};

var generateFormFromModel = exports.generateFormFromModel = function (m, schemaFields, r, formType, cb) {

	var formFields = {},
        form = new formist.Form({
            renderTag: false,
            theme: theme,
            attributes: {
                'class': 'form-horizontal'
            }
        }),
        fieldsets = {};

    // defaults to 'create'
    formType = formType || 'create';

    async.eachSeries(Object.keys(schemaFields), function (fieldName, fn) {

        var field = utils.clone(schemaFields[fieldName]); // we're going to make changes to this object, clone don't reference the original value
        var fieldOptions = field.options;
        var formField;
        var choices = {};
        var defaultValue = null;
        var embeddedDocumentForm = null;

        // merge form.edit or form.create onto form
        utils.merge(field, field[formType] || {});
        delete field.edit;
        delete field.create;

        async.series([

            // handle list types
            function (callback) {

                // determine if the field has enumValues
                if (Array.isArray(field.list) && field.list.length) {

                    // add the options to the choices object to be passed to the select box
                    if (field.type !== 'array') field.type = 'enum';

                    // list can contain an aray of strings or objects
                    field.list.forEach(function (val) {
                        if(typeof val === 'object') choices[val.value] = val.name;
                        else choices[val] = val;
                    });

                    return callback(null);

                } else if (typeof field.list === 'function') {

                    if (field.type !== 'array') {
                        field.type = 'enum';
                    }

                    field.list(function (err, listValues) {

                        if (err) {
                            console.log('Encountered error from list value function for the field ' + fieldName);
                            console.log(err);
                        }

                        field.list = (!err && listValues.length) ? listValues : [];

                        return callback(null);

                    });

                } else {

                    return callback(null);

                }

            },

            // handle defaultValues
            function (callback) {

                if (field.default !== undefined && field.type !== 'array') {

                    // work out the default value and use it
                    if (typeof field.default !== 'function') {
                        defaultValue = field.default;
                    } else if (typeof field.default === 'function' && field.type !== 'documentarray') {
                        defaultValue = field.default();
                    }

                } else if (field.default === undefined && field.type === 'datetime') {

                    field.default = function () {

                        var d = new Date();
                        return d.getFullYear() + '-' +
                                formtoolUtils.padWithZero(d.getMonth()+1) + '-' +
                                formtoolUtils.padWithZero(d.getDate()) + 'T' +
                                formtoolUtils.padWithZero(d.getHours()) + ':' +
                                formtoolUtils.padWithZero(d.getMinutes()) + ':' +
                                '00.000';
                    };

                    defaultValue = field.default();

                }

                return callback(null);

            },

            // handle ref fields
            function (callback) {

                // if the field has a reference, we need to grab the values for that type and add them in
                // if not, skip this function
                if (!m.tree[fieldName].ref) {
                    return callback(null);
                }

                // build the query
                var refQuery = linz.mongoose.models[m.tree[fieldName].ref].find(field.query.filter || {});

                if (field.query.sort) {
                    refQuery.sort(field.query.sort);
                }

                if (field.query.select) {
                    refQuery.select(field.query.select);
                }

                refQuery.exec(function (err, docs) {

                    field.type = 'enum';
                    choices = [];

                    async.each(docs, function (doc, cb) {

                        var choice = {
                            value: doc._id.toString(),
                            label: doc.title || doc.label || doc.name || doc.toString()
                        }

                        if (!field.query.label || typeof field.query.label !== 'function') {

                            choices.push(choice);
                            return cb(null);

                        }

                        field.query.label.call(doc, function (err, val) {

                            if (!err && val) {
                                choice.label = val;
                            }

                            choices.push(choice);
                            return cb(null);

                        });

                    }, function () {

                        field.list = choices;
                        callback(null);

                    });

                });

            },

            // handle embedded documents
            function (callback) {

                if (field.type !== 'documentarray') {
                    return callback(null);
                }

                field.schema.statics.getForm(function (err, f) {

                    // render the form to pass into the template
                    generateFormFromModel(field.schema, f, {}, formType, function (emdeddedForm) {

                        embeddedDocumentForm = emdeddedForm;
                        return callback(null);

                    });

                });

            },

            // create form elements where neccessary
            function (callback) {

                if (field.visible === false) {
                    return callback(null);
                }

                var fieldValue;

                switch (field.type) {

                    case 'date':
                        fieldValue = (r[fieldName] !== undefined ? moment(r[fieldName]).format('YYYY-MM-DD') : null) || defaultValue;
                        break;

                    case 'datetime':
                        fieldValue = (r[fieldName] !== undefined ? r[fieldName].toISOString().slice(0,23) : defaultValue) || defaultValue;
                        break;

                    case 'boolean':
                        fieldValue = (r[fieldName] !== undefined) ? utils.asBoolean(r[fieldName]) : defaultValue;
                        break;

                    case 'array':
                        fieldValue = r[fieldName];
                        break;

                    case 'documentarray':
                        fieldValue = r[fieldName];
                        break;

                    default:
                        fieldValue = (r[fieldName] !== undefined && r[fieldName] !== null ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue);
                        break;

                }

                var widget = (field.widget && typeof field.widget === 'function')
                        ? field.widget
                        : undefined;

                (function (cb) {

                    var wFn,
                        w;

                    // determine the widget function to execute
                    switch (field.type) {

                        case 'email':
                            wFn = (widget || linz.formtools.widgets.email());
                            break;

                        case 'boolean':
                            wFn = (widget || linz.formtools.widgets.boolean());
                            break;

                        case 'enum':
                            wFn = (widget || linz.formtools.widgets.select());
                            break;

                         case 'array':
                            wFn = (widget || linz.formtools.widgets.checkboxes());
                            break;

                        case 'password':
                            wFn = (widget || linz.formtools.widgets.password());
                            break;

                        case 'text':
                            wFn = (widget || linz.formtools.widgets.textarea());
                            break;

                        case 'date':
                            wFn = (widget || linz.formtools.widgets.date());
                            break;

                        case 'datetime':
                            wFn = (widget || linz.formtools.widgets.datetime());
                            break;

                        case 'datetimeLocal':
                            wFn = (widget || linz.formtools.widgets.datetimeLocal());
                            break;

                        case 'url':
                            wFn = (widget || linz.formtools.widgets.url());
                            break;

                        case 'hidden':
                            wFn = (widget || linz.formtools.widgets.hidden());
                            break;

                        case 'number':
                            wFn = (widget || linz.formtools.widgets.number());
                            break;

                        case 'url':
                            wFn = (widget || linz.formtools.widgets.url());
                            break;

                        case 'documentarray':
                            wFn = (widget || linz.formtools.widgets.documents());
                            break;

                        default:
                            wFn = (widget || linz.formtools.widgets.text());
                            break;

                    }

                    // execute the widget function and get the result
                    switch (field.type) {

                        case 'documentarray':
                            w = wFn(fieldName, field, fieldValue, r, formType, embeddedDocumentForm);
                            break;

                        default:
                            w = wFn(fieldName, field, fieldValue, r, formType);
                            break;

                    }

                    // add the field to the form
                    addToFormOrFieldset(form, fieldsets, field.fieldset, w);

                    // we're done here
                    return callback(null);

                })(callback);

            }
        ], function (err, results) {

            fn(null);

        });


    }, function (err) {

        cb(form);

    });

};

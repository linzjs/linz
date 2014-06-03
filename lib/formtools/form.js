var linz = require('../../'),
    formist = require('formist'),
	async = require('async'),
    theme = require('./theme'),
    utils = require('../utils'),
    moment = require('moment');

var padWithZero = function (val) {
	return String(val).length < 2 ? '0' + String(val) : val;
};

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

var generateFormFromModel = exports.generateFormFromModel = function (m, r, formType, cb) {

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

    async.eachSeries(Object.keys(m.form), function (fieldName, fn) {

        var field = utils.clone(m.form[fieldName]); // we're going to make changes to this object, clone don't reference the original value
        var fieldOptions = field.options;
        var formField;
        var choices = {};
        var defaultValue = null;

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
                    } else if (typeof field.default === 'function') {
                        defaultValue = field.default();
                    }

                } else if (field.default === undefined && field.type === 'datetime') {

                    field.default = function () {

                        var d = new Date();
                        return d.getFullYear() + '-' +
                                padWithZero(d.getMonth()+1) + '-' +
                                padWithZero(d.getDate()) + 'T' +
                                padWithZero(d.getHours()) + ':' +
                                padWithZero(d.getMinutes()) + ':' +
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
                if (!m.schema.tree[fieldName].ref) {
                    return callback(null);
                }

                // build the query
                var refQuery = linz.mongoose.models[m.schema.tree[fieldName].ref].find(field.query.filter || {});

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

                    default:
                        fieldValue = (r[fieldName] !== undefined && r[fieldName] !== null ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue);
                        break;

                }

                var widget = (field.widget && typeof field.widget === 'function')
                        ? field.widget
                        : undefined;

                switch (field.type) {

                    case 'email':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.email())(fieldName, field, fieldValue));
                        break;

                    case 'boolean':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.boolean())(fieldName, field, fieldValue));
                        break;

                    case 'enum':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.select())(fieldName, field, fieldValue));
                        break;

                     case 'array':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.checkboxes())(fieldName, field, fieldValue));
                        break;

                    case 'password':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.password())(fieldName, field, fieldValue));
                        break;

                    case 'text':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.textarea())(fieldName, field, fieldValue));
                        break;

                    case 'date':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.date())(fieldName, field, fieldValue));
                        break;

                    case 'datetime':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.datetime())(fieldName, field, fieldValue));
                        break;

                    case 'datetimeLocal':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.datetimeLocal())(fieldName, field, fieldValue));
                        break;

                    case 'number':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.number())(fieldName, field, fieldValue));
                        break;

                    case 'url':
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.url())(fieldName, field, fieldValue));
                        break;

                    default:
                        addToFormOrFieldset(form, fieldsets, field.fieldset, (widget || linz.formtools.widgets.text())(fieldName, field, fieldValue));
                        break;

                }

                return callback(null);

            }
        ], function (err, results) {

            fn(null);

        });


    }, function (err) {

        cb(form);

    });

};

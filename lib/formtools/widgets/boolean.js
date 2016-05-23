'use strict';

var Widget = require('../widget'),
    formist = require('formist'),
    utils = require('../../utils');

function constructInput (label, name, value, checked, disabled, required, attrs) {

    var attr = {
        type: 'radio',
        name: name,
        value: value,
        'data-linz-conflict-handler': 'radiosConflictHandler'
    };

    if (disabled) {
        attr.disabled = true;
    }

    if (checked) {
        attr.checked = true;
    }

    if (required) {
        attr.required = true;
        attr['data-bv-notempty-message'] = 'Please make a choice';
    }

    // allow override on any attributes, through the attr argument
    utils.merge(attr, (attrs || {}));

    return new formist.Field('input', {
        label: label,
        attributes: attr,
        theme: {
            field: function (fieldLabel, content, helpText, field) {

                // we want to append to the attributes, so default if it wasn't passed in
                return '<div class="radio radio-inline"><label>' + content + ' ' + field.options.label.label + '</label></div>';

            },
            control: function (content) {
                return content;
            }
        }
    });

}

class Boolean extends Widget {

    /**
     * Render function that returns an object that can be processed by formist
     * @return {Object} Formist Field object
     */
    static render (name, field, value, record, formType, attrs) {

        var o = {
                attributes: {},
                label: {
                    label: field.label,
                    attributes: {
                        'class': 'col-sm-2 control-label'
                    }
                }
            },
            elements = [];

        // add the helpText
        if (field.helpText) {
            o.helpText = {
                text: field.helpText,
                attributes: {
                    'class': 'col-sm-offset-2 col-sm-10 help-block'
                }
            };
        }

        // add the value if there is one
        if (value !== undefined && value !== null) {
            o.attributes.value = value;
        }

        // is it required?
        if (field.required === true) {
            o.attributes.required = true;
        }

        // special case for null booleans, in this case, there should be no checked inputs

        elements.push(constructInput('Yes', name, 'true', (value === null) ? false : utils.asBoolean(value) === true, field.disabled, field.required, attrs)); // Yes
        elements.push(constructInput('No', name, 'false', (value === null) ? false : utils.asBoolean(value) === false, field.disabled, field.required, attrs)); // No

        return new formist.Fieldgroup(o, elements);

    }

}

module.exports = Boolean;


var formist = require('formist'),
    utils = require('../../utils');

var constructInput = function (label, name, value, checked, disabled, required) {

    var attr = {
        type: 'radio',
        name: name,
        value: value
    };

    if (disabled) {
        attr.disabled = true;
    }

    if (checked) {
        attr.checked = true;
    }

    if (required) {
        attr.required = true;
    }

    return new formist.Field('input', {
        label: label,
        attributes: attr,
        theme: {
            field: function (label, content, helpText, field) {

                // we want to append to the attributes, so default if it wasn't passed in
                return '<div class="radio radio-inline"><label>' + content + ' ' + field.options.label.label + '</label></div>';

            },
            control: function (content) {
                return content;
            }
        }
    });

}

module.exports = function (attrs) {

    return function (name, field, value) {

        var o = {
                attributes : (attrs || {}),
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

        elements.push(constructInput('Yes', name, 'true', (value === null) ? false : utils.asBoolean(value) === true, field.disabled, field.required)); // Yes
        elements.push(constructInput('No', name, 'false', (value === null) ? false : utils.asBoolean(value) === false, field.disabled, field.required)); // No

        return new formist.Fieldgroup(o, elements);

    };

};

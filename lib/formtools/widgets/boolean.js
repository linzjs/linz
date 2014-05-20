
var formist = require('formist'),
    utils = require('../../utils');

var constructInput = function (label, name, value, checked) {

    var attr = {
        type: 'radio',
        name: name,
        value: value
    };

    if (checked) {
        attr.checked = true;
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

module.exports = function (name, field, value) {

    var o = {
            attributes : {},
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
                'class': 'help-block'
            }
        };
    }

    // add the value if there is one
    if (value !== undefined && value !== null) {
        o.attributes.value = value;
    }

    elements.push(constructInput('Yes', name, 'true', utils.asBoolean(value) === true)); // Yes
    elements.push(constructInput('No', name, 'false', utils.asBoolean(value) === false)); // No

    return new formist.Fieldgroup(o, elements);

};

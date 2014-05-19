
var formist = require('formist');

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

    // Yes
    elements.push(new formist.Field('input', {
        label: 'Yes',
        attributes: {
            type: 'radio',
            name: name,
            value: 'true'
        },
        theme: {
            field: function (label, content, helpText, field) {

                // we want to append to the attributes, so default if it wasn't passed in
                return '<div class="radio radio-inline"><label>' + content + ' ' + field.options.label.label + '</label></div>';

            },
            control: function (content) {
                return content;
            }
        }
    }));

    // No
    elements.push(new formist.Field('input', {
        label: 'No',
        attributes: {
            type: 'radio',
            name: name,
            value: 'false'
        },
        theme: {
            field: function (label, content, helpText, field) {

                // we want to append to the attributes, so default if it wasn't passed in
                return '<div class="radio radio-inline"><label>' + content + ' ' + field.options.label.label + '</label></div>';

            },
            control: function (content) {
                return content;
            }
        }
    }));

    return new formist.Fieldgroup(o, elements);

};

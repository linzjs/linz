
var formist = require('formist');

module.exports = function (name, field, value) {

    var o = {
        attributes : {
            type: 'email',
            'class': 'form-control',
            name: name
        },
        label: {
            label: field.label,
            attributes: {
                'class': 'col-sm-2 control-label'
            }
        }
    };

    // add the helpText
    if (field.helpText) {
        o.helpText = {
            text: field.helpText,
            attributes: {
                'class': 'help-block'
            }
        };
    }

    // is it disabled?
    if (field.disabled === true) {
        o.attributes.disabled = true;
    }

    // add the value if there is one
    if (value !== undefined && value !== null) {
        o.attributes.value = value;
    }

    // is there a placeholder?
    if (field.placeholder && field.placeholder.length) {
        o.attributes.placeholder = field.placeholder;
    }

    // is it required?
    if (field.required === true) {
        o.attributes.required = true;
    }

    return new formist.Field('input', o);

};

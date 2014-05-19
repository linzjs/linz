
var formist = require('formist');

module.exports = function (name, field, value) {

    var o = {
        attributes : {
            type: 'text',
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
                'class': 'col-sm-offset-2 col-sm-10 help-block'
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

    return new formist.Field('input', o);

};

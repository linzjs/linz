
var formist = require('formist');

module.exports = function (name, field, value) {

    var o = {
        attributes : {
            'class': 'form-control',
            name: name
        },
        label: {
            label: field.label,
            attributes: {
                'class': 'col-sm-2 control-label'
            }
        },
        options: field.list || [],
        value: value
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

    return new formist.Field('select', o);

};

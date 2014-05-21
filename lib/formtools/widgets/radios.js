
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

    // create each element
    (field.list || []).forEach(function (f) {

        var el,
            val = f;

        if (typeof f === 'object') {
            val = (f.value || f.label || f.toString());
        }

        el = new formist.Field('input', {
            label: f,
            attributes: {
                type: 'radio',
                name: name,
                value: val
            },
            theme: {
                field: function (label, content, helpText, field) {

                    // we want to append to the attributes, so default if it wasn't passed in
                    return '<div class="radio"><label>' + content + ' ' + field.options.label.label + '</label></div>';

                },
                control: function (content) {
                    return content;
                }
            }
        });

        if ((value || '').indexOf(val) >= 0) {
            el.attribute('checked', true);
        }

        elements.push(el);

    });

    return new formist.Fieldgroup(o, elements);

};

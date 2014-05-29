
var formist = require('formist');

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

        // create each element
        (field.list || []).forEach(function (f) {

            var el = new formist.Field('input', {
                label: f,
                attributes: {
                    type: 'checkbox',
                    name: name,
                    value: f
                },
                theme: {
                    field: function (label, content, helpText, field) {

                        // we want to append to the attributes, so default if it wasn't passed in
                        return '<div class="checkbox"><label>' + content + ' ' + field.options.label.label + '</label></div>';

                    },
                    control: function (content) {
                        return content;
                    }
                }
            });

            if ((value || '').indexOf(f) >= 0) {
                el.attribute('checked', true);
            }

            if (field.disabled === true) {
                el.attribute('disabled', true);
            }

            elements.push(el);

        });

        return new formist.Fieldgroup(o, elements);

    };

};

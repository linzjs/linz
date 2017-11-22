
var formist = require('formist');

module.exports = function (attrs) {

    function checkboxesWidget (name, field, value) {

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

            if (typeof f === 'string') {
                f = {
                    label: f,
                    value: f
                };
            }

            var el = new formist.Field('input', {
                label: f.label,
                attributes: {
                    type: 'checkbox',
                    name: name,
                    value: f.value,
                    'data-linz-conflict-handler': 'checkboxesConflictHandler'
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

            if ((value || '').indexOf(f.value) >= 0) {
                el.attribute('checked', true);
            }

            if (field.disabled === true) {
                el.attribute('disabled', true);
            }

            if (field.required === true) {
                el.attribute('required', true);
                el.attribute('data-bv-notempty-message', 'Please choose one or more options');
            }

            // allow override on any attributes, through the attr argument
            for (attribute in attrs) {
                el.attribute(attribute, attrs[attribute]);
            }

            elements.push(el);

        });

        return new formist.Fieldgroup(o, elements);

    };

    return checkboxesWidget;

};

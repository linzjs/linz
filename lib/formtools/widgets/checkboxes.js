
var formist = require('formist');

module.exports = function (attrs) {

    return function (name, field, value) {

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

        // Add hidden input element with the same name as checkbox
        // This will make browsers to pass value of hidden element to server on form post when all check boxes are unchecked
        //
        // Note 1: When one or more checkboxes are selected, the sever will receive an array of values of selected
        //         checkboxes as well as a value of the hidden input element that has same name as checkbox.
        var hiddenElm = new formist.Field('input', {
                attributes: {
                    type: 'hidden',
                    name: name,
                    value: '[]'
                }
            });

        elements.push(hiddenElm);

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

};

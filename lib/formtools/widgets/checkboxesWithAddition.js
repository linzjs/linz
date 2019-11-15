'use strict';

const formist = require('formist');
const linz = require('../../../');

module.exports = function(attrs) {
    function checkboxesWidthAdditionWidget(name, field, value) {
        var o = {
                attributes: { autocomplete: 'off' },
                label: {
                    label: field.label,
                    attributes: {
                        class: 'col-sm-2 control-label',
                    },
                },
            },
            elements = [];

        // add the helpText
        if (field.helpText) {
            o.helpText = {
                text: field.helpText,
                attributes: {
                    class: 'col-sm-offset-2 col-sm-10 help-block',
                },
            };
        }

        // add the value if there is one
        if (value !== undefined && value !== null) {
            o.attributes.value = value;

            if (value.length > 0) {
                // overwrite the default list with value
                field.list = value;
            }
        }

        // is it required?
        if (field.required === true) {
            o.attributes.required = true;
        }

        // create each element
        (field.list || []).forEach(function(f) {
            if (typeof f === 'string') {
                f = {
                    label: linz.api.util.escape(f),
                    value: f,
                };
            }

            var el = new formist.Field('input', {
                label: f.label,
                attributes: {
                    'type': 'checkbox',
                    'name': name,
                    'value': f.value,
                    'data-linz-conflict-handler':
                        'checkboxesWithAdditionConflictHandler',
                },
                theme: {
                    field: function(label, content, helpText, field) {
                        // we want to append to the attributes, so default if it wasn't passed in
                        return (
                            '<div class="checkbox"><label>' +
                            content +
                            ' <span>' +
                            field.options.label.label +
                            '</span></label></div>'
                        );
                    },
                    control: function(content) {
                        return content;
                    },
                },
            });

            if ((value || '').indexOf(f.value) >= 0) {
                el.attribute('checked', true);
            }

            if (field.disabled === true) {
                el.attribute('disabled', true);
            }

            if (field.required === true) {
                el.attribute('required', true);
                el.attribute(
                    'data-bv-notempty-message',
                    'Please choose one or more options'
                );
            }

            // allow override on any attributes, through the attr argument
            for (attribute in attrs) {
                el.attribute(attribute, attrs[attribute]);
            }

            elements.push(el);
        });

        // Include button to add extra value to list
        var el = new formist.Field('input', {
            label: 'others',
            attributes: {
                type: 'checkbox',
                name: name,
                value: '',
                checked: true,
                disabled: true,
            },
            theme: {
                field: function(label, content, helpText, field) {
                    var html =
                        '<div class="row"><div class="col-lg-3"><div class="input-group">' +
                        '<template><div><div class="checkbox"><label>' +
                        content +
                        ' <span class="checkbox-label">' +
                        field.options.label.label +
                        '</span></label></div></div></template>' +
                        '<input type="text" class="form-control input-sm" name="add-checkbox">' +
                        '<span class="input-group-btn"><button class="btn btn-default btn-sm" type="button" data-linz-control="add-checkbox"><span class="glyphicon glyphicon-plus"></span></button></span>' +
                        '</div></div></div>';
                    return html;
                },
                control: function(content) {
                    return content;
                },
            },
        });

        elements.push(el);

        return new formist.Fieldgroup(o, elements);
    }

    return checkboxesWidthAdditionWidget;
};

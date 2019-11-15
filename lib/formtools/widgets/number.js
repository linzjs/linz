
var formist = require('formist'),
    utils = require('../../utils');

module.exports = function (attrs) {

    function numberWidget (name, field, value) {

        var o = {
            attributes : {
                type: 'text',
                'class': 'form-control',
                name: name,
                pattern: '[0-9]*', // this is required to trigger the numeric keyboards in iOs, not applicable for Android
                'data-bv-regexp': 'false', // this is disabled in order to use the numeric validator
                'data-bv-numeric': true,
                'data-bv-numeric-message': 'Only numbers are allowed. E.g. 11, 11.50',
                'data-linz-conflict-handler': 'numericConflictHandler'
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

        // is it required?
        if (field.required === true) {
            o.attributes.required = true;
            o.attributes['data-bv-notempty-message'] = 'Please enter a value';
        }

        // is there a placeholder?
        if (field.placeholder && field.placeholder.length) {
            o.attributes.placeholder = field.placeholder;
        }

        // add the value if there is one
        if (value !== undefined && value !== null) {
            o.attributes.value = value;
        }

        // allow override on any attributes, through the attr argument
        utils.merge(o.attributes, (attrs || {}));

        return new formist.Field('input', o);

    };

    return numberWidget;

};

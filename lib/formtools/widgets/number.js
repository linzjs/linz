
var formist = require('formist'),
    utils = require('../../utils');

module.exports = function (attrs) {

    return function (name, field, value) {

        var o = {
            attributes : utils.merge((attrs || {}), {
                type: 'number',
                'class': 'form-control',
                name: name,
                min: '0',
                step: '1',
                pattern: '[0-9]+'
            }),
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
        }

        // is there a placeholder?
        if (field.placeholder && field.placeholder.length) {
            o.attributes.placeholder = field.placeholder;
        }

        // add the value if there is one
        if (value !== undefined && value !== null) {
            o.attributes.value = value;
        }

        return new formist.Field('input', o);

    };

};

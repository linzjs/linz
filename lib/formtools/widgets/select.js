
var formist = require('formist'),
    clone = require('clone'),
    utils = require('../../utils');

module.exports = function (attrs) {

    return function (name, field, value) {

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
            options: field.list || []
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

        // is there a value?
        if (value !== undefined) {
            o.value = value;
        }

        // is there a placeholder?
        if (field.placeholder && field.placeholder.length) {
            o.options = clone(o.options);
            o.options.unshift({
                value: '',
                label: field.placeholder
            });
        }

        // is it required?
        if (field.required === true) {
            o.attributes.required = true;
            o.attributes['data-bv-notempty-message'] = 'Please make a choice';
        }

        // allow override on any attributes, through the attr argument
        utils.merge(o.attributes, (attrs || {}));

        return new formist.Field('select', o);

    };

};

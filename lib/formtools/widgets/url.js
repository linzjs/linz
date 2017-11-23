
var formist = require('formist'),
    utils = require('../../utils');

module.exports = function (attrs) {

    function urlWidget (name, field, value) {

        var o = {
            attributes : {
                type: 'url',
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

        // is it required?
        if (field.required === true) {
            o.attributes.required = true;
            o.attributes['data-bv-notempty-message'] = 'Please enter a valid URL';
        }

        // is there a placeholder?
        if (field.placeholder && field.placeholder.length) {
            o.attributes.placeholder = field.placeholder;
        }

        // add the value if there is one
        if (value !== undefined && value !== null) {
            o.attributes.value = value;
        }

        o.attributes['data-bv-uri-message'] = 'Please enter a valid URL (starting with a valid URI, i.e. http:// or https:// or mailto:)';

        // allow override on any attributes, through the attr argument
        utils.merge(o.attributes, (attrs || {}));

        return new formist.Field('input', o);

    };

    return urlWidget;

};

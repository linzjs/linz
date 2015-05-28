
var formist = require('formist'),
    utils = require('../../utils');

var toEscape = {
        '<': '&lt;',
        '>': '&gt;' };

var escape = function (value) {

    return String(value || '').replace(/[<>]/g, function (char) {
        return toEscape[char];
    });

};

module.exports = function (attrs) {

    return function (name, field, value) {

        /**
         * To specify a custom wysiwyg config settings:
         * data-linz-wysiwyg-config: '/path/to/file'
         * To add a widget, provide widget name, path to widget plugin and path to widget css (optional) in the following format:
         * {widget name}:{/path/to/file}[:{widget css file}]
         * To add more than one widgets, add addition widgets in a list format using comma as delimiters, e.g.
         * data-linz-wysiwyg-widget: 'simplebox:/path/to/simplebox,simplebox2:/path/to/simplebox2'
         */
        var o = {
            attributes : {
                'class': 'ckeditor',
                name: name,
                'data-linz-conflict-handler': 'textareaConflictHandler'
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
            o.attributes.value = escape(value);
        }

        // allow override on any attributes, through the attr argument
        utils.merge(o.attributes, (attrs || {}));

        return new formist.Field('textarea', o);

    };

};

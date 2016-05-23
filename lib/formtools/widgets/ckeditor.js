'use strict';

var Widget = require('../widget'),
    formist = require('formist'),
    utils = require('../../utils');

function escape (value) {

    var toEscape = {
        '<': '&lt;',
        '>': '&gt;' };

    return String(value || '').replace(/[<>]/g, function (char) {
        return toEscape[char];
    });

}

class CKEditor extends Widget {

    /**
     * Render function that returns an object that can be processed by formist
     * @return {Object} Formist Field object
     */
    static render (name, field, value, record, formType, attrs) {

        /**
         * To specify a custom ckeditor config settings:
         * data-linz-ckeditor-config: '/path/to/file'
         * data-linz-ckeditor-style: '/path/to/file'
         * To add a widget, provide widget name and a path to widget plugin in the following format:
         * {widget name}:{/path/to/file}
         * To add more than one widgets, add addition widgets in a list format using comma as delimiters, e.g.
         * data-linz-ckeditor-widget: 'simplebox:/path/to/simplebox,simplebox2:/path/to/simplebox2'
         */
        var o = {
            attributes: {
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

    }

}

module.exports = CKEditor;

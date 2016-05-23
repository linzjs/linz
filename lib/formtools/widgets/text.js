'use strict';

var Widget = require('../widget'),
    formist = require('formist'),
    utils = require('../../utils');

class Text extends Widget {

    /**
     * Render function that returns an object that can be processed by formist
     * @return {Object} Formist Field object
     */
    static render (name, field, value, record, formType, attrs) {

        var o = this.default;

        // set form field name and label
        o.attributes.name = name;
        o.label.label = field.label;

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

    }

}

module.exports = Text;

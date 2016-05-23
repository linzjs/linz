'use strict';

var formist = require('formist');

/**
 * A base class that returns an text input
 */
class Widget {

    constructor (name, field, value, record, formType) {

        this.name = name;
        this.field = field;
        this.value = value;
        this.record = record;
        this.formType = formType;

        this.o = {
            attributes: {
                type: 'text',
                class: 'form-control',
                name: name,
                'data-linz-conflict-handler': 'textConflictHandler'
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
            this.o.helpText = {
                text: field.helpText,
                attributes: {
                    'class': 'col-sm-offset-2 col-sm-10 help-block'
                }
            };
        }

        // is it disabled?
        if (field.disabled === true) {
            this.o.attributes.disabled = true;
        }

        // is it required?
        if (field.required === true) {
            this.o.attributes.required = true;
            this.o.attributes['data-bv-notempty-message'] = 'Please enter a value';
        }

        // is there a placeholder?
        if (field.placeholder && field.placeholder.length) {
            this.o.attributes.placeholder = field.placeholder;
        }

        // add the value if there is one
        if (value !== undefined && value !== null) {
            this.o.attributes.value = value;
        }

    }

    /**
     * Render function that returns Formist object
     * @return {Object} Formist Field object
     */
    render () {

        return new formist.Field('input', this.o);

    }

}

module.exports = Widget;

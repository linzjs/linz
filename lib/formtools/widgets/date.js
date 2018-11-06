
var formist = require('formist'),
    moment = require('moment'),
    templates = require('../templates'),
    utils = require('../../utils');

module.exports = function (attrs = {}) {

    const dateFormat = attrs['data-linz-date-format'] || 'YYYY-MM-DD';

    function dateWidget (name, field, value) {

        var o = {
            attributes : {
                autocomplete: 'off',
                type: 'text',
                'class': 'form-control',
                name: name,
                'data-ui-datepicker': 'true',
                'data-linz-conflict-handler': 'dateConflictHandler',
                'data-linz-date-format': dateFormat,
                'data-linz-date-use-current': 'false',
                'data-linz-date-side-by-side': 'false',
            },
            label: {
                label: field.label,
                attributes: {
                    'class': 'col-sm-2 control-label'
                }
            },
            theme: {
                control: function (content, input) {
                    return templates.date({ content });
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
            o.attributes['data-bv-notempty-message'] = 'Please select a date';
        }

        // is there a placeholder?
        if (field.placeholder && field.placeholder.length) {
            o.attributes.placeholder = field.placeholder;
        }

        // Add the value if there is one.
        // Add it as an attribute rather than the value.
        // Client-side code will take over and render the date using the correct format.
        if (value !== undefined && value !== null) {
            o.attributes['data-linz-date-value'] = value;
        }

        // allow override on any attributes, through the attr argument
        utils.merge(o.attributes, (attrs || {}));

        this.data = o;

        return new formist.Field('input', o);

    };

    // Add a function to the function object, which will transform a value ready for the database.
    dateWidget.transform = (name, field, value, form) => {

        let { linzTimezoneOffset = '+00:00' } = form;

        // Manually set the timezone offset.
        if (attrs['data-utc-offset']) {
            linzTimezoneOffset = attrs['data-utc-offset'];
        }

        return moment.parseZone(moment(value, dateFormat)
            .utcOffset(linzTimezoneOffset, true)
            .format())
            .toISOString();

    };

    return dateWidget;

};

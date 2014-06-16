
var formist = require('formist'),
    utils = require('../../utils'),
    theme = require('../theme'),
    handlebars = require('handlebars'),
    templates = require('../templates'),
    form = require('../form');

module.exports = function (attrs) {

    return function (name, field, value, record, formType, emdeddedDocumentForm) {

        var o = {
            attributes : {
                type: 'text',
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

        // return an object with a render function, as it will be called later
        return {

            render: function (theme) {

                // locals for the template
                var content,
                    locals = {
                        name: name,
                        form: emdeddedDocumentForm.render(),
                        json: JSON.stringify(value || [])
                    };

                // document array template
                content = templates.documents(locals);

                return theme.field('<label class="' + o.label.attributes.class + '">' + o.label.label + '</label>', theme.control(content, { options: { attributes: {} } }), '', { attributes: {} });

            }

        };

    };

};

var formist = require('formist'),
    utils = require('../../utils');

module.exports = function(attrs) {
    function hiddenWidget(name, field, value) {
        var o = {
            attributes: {
                type: 'hidden',
                name: name,
            },
            theme: {
                field: function(label, content, helpText, field) {
                    // we want to append to the attributes, so default if it wasn't passed in
                    return content;
                },
            },
        };

        // add the value if there is one
        if (value !== undefined && value !== null) {
            o.attributes.value = value;
        }

        // allow override on any attributes, through the attr argument
        utils.merge(o.attributes, attrs || {});

        return new formist.Field('input', o);
    }

    return hiddenWidget;
};

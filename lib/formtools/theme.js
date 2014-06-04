// export modules

module.exports = {
    field: function (label, content, helpText, field) {

        var attrClass = 'form-group';

        if (field.attributes.required) {
            attrClass += ' required';
        }

        return '<div class="' + attrClass + '">' + label + content + helpText + '</div>';
    },
    fieldgroup: {
        group: function (label, content, helpText, field) {

            var attrClass = 'form-group';

            if (field.options.attributes.required) {
                attrClass += ' required';
            }

            return '<div class="' + attrClass + '">' + label + content + helpText + '</div>';
        },
        fields: function (content) {
            return '<div class="col-sm-10">' + content + '</div>';
        }
    },
    control: function (content, field) {

        if (field.options.attributes.type === 'hidden') {
            return content;
        }

        return '<div class="col-sm-10">' + content + '</div>';
    }
}

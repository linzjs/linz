var linz = require('../../../');

module.exports = {
    renderer: function booleanFilterRenderer(fieldName, callback) {
        return callback(
            null,
            '<template><label class="checkbox-inline"><input type="radio" name="' +
                fieldName +
                '" value="true" required> Yes</label><label class="checkbox-inline"><input type="radio" name="' +
                fieldName +
                '" value="false" required> No</label></template>'
        );
    },

    filter: function booleanFilterFilter(fieldName, form, callback) {
        var obj = {};

        obj[fieldName] = linz.utils.asBoolean(form[fieldName]);

        return callback(null, obj);
    },

    bind: function booleanFilterBinder(fieldName, form, callback) {
        var html = [];
        var isChecked = linz.utils.asBoolean(form[fieldName]);

        html.push(
            '<label class="checkbox-inline"><input type="radio" name="' +
                fieldName +
                '" value="true"' +
                (isChecked ? ' checked' : '') +
                ' required> Yes</label><label class="checkbox-inline"><input type="radio" name="' +
                fieldName +
                '" value="false"' +
                (isChecked ? '' : ' checked') +
                ' required> No</label>'
        );

        return callback(null, html);
    },
};

var linz = require('../../../');

module.exports = {
    renderer: function dateFilterRenderer (fieldName, callback) {
        return callback(null, '<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true"> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false"> No</label>');
    },

    filter: function dateFilterFilter (fieldName, form, callback) {

        var obj = {};

        obj[fieldName] = linz.utils.asBoolean(form[fieldName]);

        return callback(null, obj);

    },

    bind: function defaultFieldBinder (fieldName, form, callback) {

        var html = [];
        var isChecked = linz.utils.asBoolean(form[fieldName]);

        html.push('<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true"' + (isChecked ? ' checked' : '') + '> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false"' + (isChecked ? '' : ' checked') + '> No</label>');

        return callback(null, html);

    }
};

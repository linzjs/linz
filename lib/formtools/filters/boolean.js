var linz = require('../../../');

module.exports = {
    renderer: function dateFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="radio" name="' + fieldName + '" class="form-control" value="true">Yes <input type="radio" name="' + fieldName + '" class="form-control" value="false">No');
    },

    filter: function dateFilterFilter (fieldName, form, callback) {

        var obj = {};

        obj[fieldName] = linz.utils.asBoolean(form[fieldName]);

        return callback(null, obj);

    },

    bind: function defaultFieldBinder (fieldName, form, callback) {

        var html = [];
        var isChecked = linz.utils.asBoolean(form[fieldName]);

        html.push('<input type="radio" name="' + fieldName + '" class="form-control" value="true"' + (isChecked ? ' checked' : '') + '>Yes <input type="radio" name="' + fieldName + '" class="form-control" value="false"' + (isChecked ? '' : ' checked') + '>No');

        return callback(null, html);

    }
};

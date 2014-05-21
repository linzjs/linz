var linz = require('../../../');

module.exports = {
    renderer: function dateFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="radio" name="' + fieldName + '" class="form-control" value="true">Yes <input type="radio" name="' + fieldName + '" class="form-control" value="false">No');
    },

    filter: function dateFilterFilter (fieldName, form, callback) {

        var obj = {};

        obj[fieldName] = linz.utils.asBoolean(form[fieldName]);

        return callback(null, obj);

    }
};

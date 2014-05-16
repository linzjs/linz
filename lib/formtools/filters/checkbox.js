module.exports = {
    renderer: function dateFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="checkbox" name="' + fieldName + '" class="form-control">');
    },

    filter: function dateFilterFilter (fieldName, form, callback) {
        return callback(null, { fieldName: form[fieldName] });
    }
};

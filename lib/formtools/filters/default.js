module.exports = {
    renderer: function defaultFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="text" name="' + fieldName + '" class="form-control">');
    },

    filter: function defaultFilterFilter (fieldName, form, callback) {
        return callback(null, { fieldName: form[fieldName] });
    }
};

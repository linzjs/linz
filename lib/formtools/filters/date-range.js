module.exports = {
    renderer: function dateFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="date" name="' + fieldName + '_dateFrom" class="form-control" style="width:50%;"><input type="date" name="' + fieldName + '_dateTo" class="form-control" style="width:50%;">');
    },

    filter: function dateFilterFilter (fieldName, form, callback) {
        return callback(null, { fieldName: form[fieldName] });
    }
};

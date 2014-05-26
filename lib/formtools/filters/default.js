module.exports = {

    renderer: function defaultFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="text" name="' + fieldName + '[]" class="form-control" required>');
    },

    filter: function defaultFilterFilter (fieldName, form, callback) {

        var obj = {},
            searchKeywords = [];

        form[fieldName].forEach(function (val) {
            searchKeywords.push(val.trim().replace(/\s+/g,' '));
        });

        // regex match using OR condition. Regex search is case-insensitive and global
        obj[fieldName] = { $regex: new RegExp(searchKeywords.join('|'), 'ig') };

        return callback(null, obj);

    },

    bind: function defaultFilterBinder (fieldName, form, callback) {

        var html = [];

        form[fieldName].forEach(function (val) {
            html.push('<input type="text" name="' + fieldName + '[]" class="form-control" value="' + val + '" required>');
        });

        return callback(null, html);

    }

};

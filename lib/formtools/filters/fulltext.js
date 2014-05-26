module.exports = {

    renderer: function fulltextFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="text" name="' + fieldName + '[]" class="form-control" required>');
    },

    filter: function fulltextFilterFilter (fieldName, form, callback) {

        var obj = {},
            searchKeywords = [];

        form[fieldName].forEach(function (val) {
            searchKeywords.push(val.trim().replace(/\s+/g,'|'));
        });

        obj[fieldName] = { $regex: new RegExp(searchKeywords.join('|'), 'ig') };

        return callback(null, obj);

    },

    bind: function fulltextFilterBinder (fieldName, form, callback) {

        var html = [];

        form[fieldName].forEach(function (val) {
            html.push('<input type="text" name="' + fieldName + '[]" class="form-control" value="' + val + '" required>');
        });

        return callback(null, html);

    }

};

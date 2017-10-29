module.exports = {

    renderer: function fulltextFilterRenderer (fieldName, callback) {
        return callback(null, '<template><input type="text" name="' + fieldName + '[]" class="form-control" required></template>');
    },

    filter: function fulltextFilterFilter (fieldName, form, callback) {

        var obj = {},
            searchKeywords = [];

        form[fieldName].forEach(function (val) {

            var str = val.trim();

            // escape characters */\()?.$^[]+-=|{}:`'&!
            str = str.replace(/([*\/\\\(\)\?\.\$\^\[\]\+\-\=\|\{\}\:\`\'\&\!])/g, '\\$1');

            // replace one or more spaces between search keywords with an OR operation for multiple match searches
            str = str.replace(/\s+/g,'|');

            searchKeywords.push(str);

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

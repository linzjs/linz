module.exports = {

    renderer: function defaultFilterRenderer (fieldName, callback) {
        return callback(null, '<template><input type="text" name="' + fieldName + '[]" class="form-control" required></template>');
    },

    filter: function defaultFilterFilter (fieldName, form, callback) {

        var obj = {},
            searchKeywords = [];

        form[fieldName].forEach(function (val) {

            // replace one or more spaces between search keywords with one single space
            var str = val.trim().replace(/\s+/g,' ');

            // escape characters */\()?.$^[]+-=|{}:`'&!
            str = str.replace(/([*\/\\\(\)\?\.\$\^\[\]\+\-\=\|\{\}\:\`\'\&\!])/g, '\\$1');

            searchKeywords.push(str);

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

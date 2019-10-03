'use strict';

const linz = require('../../../');

module.exports = {

    renderer: function numberFilterRenderer (fieldName, callback) {
        return callback(null, '<template><input type="text" name="' + fieldName + '[]" class="form-control" required pattern="[0-9]*" placeholder="Only digits are allowed."></template>');
    },

    filter: function numberFilterFilter (fieldName, form, callback) {

        var obj = {},
            searchKeywords = [],
            or = [];

        form[fieldName].forEach(function (val) {
            searchKeywords.push(val.trim().replace(/\s+/g,' '));
        });

        // loop through each instance of this filter's form post value
        searchKeywords.forEach(function (searchKeyword) {
            or.push(Number(searchKeyword.trim()));
        });

        // regex match using OR condition. Regex search is case-insensitive and global
        obj[fieldName] = or;

        return callback(null, obj);

    },

    bind: function numberFilterBinder (fieldName, form, callback) {

        var html = [];

        form[fieldName].forEach(function (val) {
            html.push('<input type="text" name="' + fieldName + '[]" class="form-control" value="' + linz.api.util.escape(val) + '" required>');
        });

        return callback(null, html);

    }

};

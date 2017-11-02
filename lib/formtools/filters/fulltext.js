const linz = require('../../../');

module.exports = {

    renderer: function fulltextFilterRenderer (fieldName, callback) {
        return callback(null, '<template><input type="text" name="' + fieldName + '[]" class="form-control" required></template>');
    },

    filter: function fulltextFilterFilter (fieldName, form, callback) {

        const obj = {};
        const data = form[fieldName];
        const keywords = Array.isArray(data) ? data.join(' ') : data;

        obj[fieldName] = linz.api.query.regexp(keywords);

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

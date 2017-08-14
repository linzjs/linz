var utils = require('../../utils');

module.exports = function (list, multiple) {

    if (!list) {
        throw new Error ('List paramenter is missing for the list filter');
    }

    if (!Array.isArray(list) && typeof list !== 'function') {
        throw new Error('List paramenter must either be an array or a function.');
    }

    var renderHTML = function renderHTML (fieldName, data, form) {

        var html = '<select name="' + fieldName + '[]" class="form-control multiselect"' + ((multiple) ? ' multiple' : '') + '>';

        if (data) {

            data.forEach(function (obj) {

                var selected = '';

                if (form && form[fieldName]) {

                    const values = form[fieldName].map(value => utils.parseNull(value));

                    selected = values.indexOf(obj.value) >= 0 ? ' selected': '';

                }

                html += '<option value="' + obj.value+ '"' + selected + '>' + obj.label + '</option>';

            });

        }

        html += '</select>';

        return html;

    };


    return {

        renderer: function multiSelectFilterRenderer (fieldName, callback) {

            if (Array.isArray(list)) {

                var results = utils.labelValueArray(list);
                    html = renderHTML(fieldName, results, {});

                return callback(null, html);
            }

            // list is a function, let's execute it
            list(function (err, results) {

                if (err) {
                    return callback(err);
                }

                var html = renderHTML(fieldName, results, {});

                return callback(null, html);

            });

        },

        filter: function multiSelectFilterFilter (fieldName, form, callback) {

            var obj = {};
            obj[fieldName] = { $in: form[fieldName].map(value => utils.parseNull(value)) };

            return callback(null, obj);

        },

        bind: function multiSelectFilterBinder (fieldName, form, callback) {

            if (Array.isArray(list)) {

                var results = utils.labelValueArray(list);
                    html = [renderHTML(fieldName, results, form)];

                return callback(null, html);
            }

            // list is a function, let's execute it
            list(function (err, results) {

                if (err) {
                    return callback(err);
                }

                var html = [renderHTML(fieldName, results, form)];

                return callback(null, html);

            });

        }

    };

}

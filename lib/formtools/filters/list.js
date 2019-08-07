var utils = require('../../utils');
const linz = require('../../../');

/**
 * Multiselect list filter.
 * @param {Array} list The list array.
 * @param {Boolean} multiple Enable multiselect.
 * @param {Object} options Filter options.
 * @param {Boolean} options.parseNumber Optionally parse the value as a number (This will break filtering by phone numbers).
 * @return {Object} Returns the filter object.
 */
module.exports = function (list, multiple, options) {

    const settings = Object.assign({}, {
        parseNumber: false,
    }, options);

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

                    const values = form[fieldName].map(value => utils.parseString(value, {
                        parseNumber: settings.parseNumber,
                    }));

                    selected = values.indexOf(obj.value) >= 0 ? ' selected': '';

                }

                html += '<option value="' + linz.api.util.escape(obj.value) + '"' + selected + '>' + linz.api.util.escape(obj.label) + '</option>';

            });

        }

        html += '</select>';

        return html;

    };

    var wrapInTemplate = function wrapInTemplate (html) {

        return '<template>' + html + '</template>';

    };

    return {

        renderer: function multiSelectFilterRenderer (fieldName, callback) {

            if (Array.isArray(list)) {

                var results = utils.labelValueArray(list);
                    html = renderHTML(fieldName, results, {});

                return callback(null, wrapInTemplate(html));
            }

            // list is a function, let's execute it
            list(function (err, results) {

                if (err) {
                    return callback(err);
                }

                var html = renderHTML(fieldName, results, {});

                return callback(null, wrapInTemplate(html));

            });

        },

        filter: function multiSelectFilterFilter(fieldName, form, callback) {

            var obj = {};
            obj[fieldName] = {
                $in: form[fieldName].map(value => utils.parseString(value, {
                    parseNumber: settings.parseNumber,
                })),
            };

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

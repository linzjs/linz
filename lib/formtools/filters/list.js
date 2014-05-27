module.exports = function (list,multiple) {

    if (!list) {
        throw new Error ('List paramenter is missing for the list filter');
    }

    // convert list to the format we need
    var options = [];

    list.forEach(function (obj) {
        if (typeof obj === 'string') {
            options.push({ label: obj, value: obj });
        } else {
            options.push(obj);
        }
    });

    return {

        renderer: function multiSelectFilterRenderer (fieldName, callback) {

            var html = '<select name="' + fieldName + '[]" class="form-control multiselect"' + ((multiple) ? ' multiple' : '') + '>';

            options.forEach(function (obj) {
                html += '<option value="' + obj.value+ '">' + obj.label + '</option>';
            });

            html += '</select>';


            return callback(null, html);

        },

        filter: function multiSelectFilterFilter (fieldName, form, callback) {

            var obj = {};
            obj[fieldName] = { $in: form[fieldName] };

            return callback(null, obj);

        },

        bind: function multiSelectFilterBinder (fieldName, form, callback) {

            var html = [],
                selectHtml = '<select name="' + fieldName + '[]" class="form-control multiselect"' + ((multiple) ? ' multiple' : '') + '>';

            options.forEach(function (obj) {

                var bSelected = false;

                form[fieldName].forEach(function (val) {
                    if (obj.value === val) {
                        bSelected = true;
                    }
                });

                selectHtml += '<option value="' + obj.value+ '"' + ((bSelected) ? ' selected': '') + '>' + obj.label + '</option>';

            });

            selectHtml += '</select>';

            html.push(selectHtml);

            return callback(null, html);

        }

    };

}

var Handlebars = require('handlebars');

Handlebars.registerHelper('inc', function(value, options) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper('selectOptions', function(options, selectedValue) {
    var html = '';

    options.forEach(function (option) {
        html += '<option value="' + option.value + '"' + (option.value === selectedValue ? ' selected' : '') + '>' + option.label + '</option>';
    });

    return new Handlebars.SafeString(html);
});

Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

Handlebars.registerHelper('renderDiffs', function(results, options) {

    var html = '',
        renderValue = function renderValue (val) {

            if (!val) {
                return '&nbsp;';
            }

            if (val instanceof Date) {
                return val;
            }

            if (typeof val === 'object') {
                var str = '';

                Object.keys(val).forEach(function (key) {

                    if (key === '_id' || key === 'createdBy' || key === 'dateModified' || key === 'dateCreated') {
                        return;
                    }

                    str += '<li>'+ key + ': ' + val[key] + '</li>';

                });

                return '<ul class="list-unstyled">' + str + '</ul>';
            }

            return val;
        };

    results.forEach(function (result, index) {

        var str = '',
            lhs = result.lhs,
            rhs = result.rhs,
            fieldName = result.path[0];

        if (result.textDiff) {

            var diffHtml = '';

            result.textDiff.forEach(function(part) {

                // green for additions, red for deletions
                var color = part.added ? 'green' : part.removed ? 'red' : '';

                if (!color) {
                    diffHtml += part.value;
                    return;
                }

                diffHtml += (color === 'red' ? '<span class="removed">' + part.value + '</span>' : '<span class="new">' + part.value + '</span>');

            });

            rhs = diffHtml;

        }

        if (result.kind === 'A') {
            lhs = result.item.lhs;
            rhs = result.item.rhs;
        }

        if (result.kind === 'N') {
            rhs = rhs || '(new field, but has no value)';
        }

        if (index >= 1 && fieldName == results[index-1].path[0]) {
            fieldName = undefined;
        }

        str += '<tr>'
                + '<td>' + renderValue(fieldName) + '</td>'
                + '<td>' + renderValue(lhs) + '</td>'
                + '<td>' + renderValue(rhs) + '</td>';
             + '<tr>';

        html += str;
    });

    return new Handlebars.SafeString(html);

});

module.exports = Handlebars;

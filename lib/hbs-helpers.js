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

Handlebars.registerHelper('eachHistory', function(items, id, locals, options) {

    var html = '';
console.log(locals);
    items.forEach(function (item) {
        if (item._id !== id) {
            html += '<li><a href="' + locals.adminPath + '/model/' + locals.modelName + '/' + locals.pageId + '/versions-compare/' + id + '/' + item._id + '" data-linz-control="versions-compare">' + item.label + '</a></li>';
        }
    });

    return new Handlebars.SafeString(html);

});

module.exports = Handlebars;

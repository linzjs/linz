
var async = require('async'),
    cellRenderers = require('./renderers-cell');


var mapCellRenderer = function (type) {

    //add text, password, enum and hidden function in renderers-cell.js

    var cellrenderer;

    switch (type) {

        case 'email':
            cellrenderer = 'text';
            break;

        case 'number':
            cellrenderer = 'text';
            break;

        case 'digit':
            cellrenderer = 'text';
            break;

        case 'tel':
            cellrenderer = 'text';
            break;

        case 'documentarray':
            cellrenderer = 'documentArray';
            break;

        case 'datetime':
            cellrenderer = 'dateTime';
            break;

        case 'datetimeLocal':
            cellrenderer = 'localDateTime';
            break;

        default:
            cellrenderer = 'default';
            break;

    }

    return cellrenderer;
};

function render(schema, schemaFields, record, model, callback) {

    var fieldsets = {};

    async.eachSeries(Object.keys(schemaFields), function (fieldName, cb) {

        var field = schemaFields[fieldName],
            title = field.fieldset || '(No fieldset defined)';

        if (!fieldsets[title]) {
            fieldsets[title] = [];
        }

        var renderer = (cellRenderers[field.type]) ? field.type : mapCellRenderer(field.type);

        cellRenderers[renderer](record[fieldName], record, fieldName, model, function (err, value) {

            if (err) {
                return cb(err);
            }

            fieldsets[title].push({
                label: field.label,
                value: value
            });

            return cb();
        });

    }, function (err) {

        return callback(err, fieldsets);
    });

}

module.exports = {
    render: render
};

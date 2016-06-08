
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

var generateViewFromModel = exports.generateViewFromModel = function (schema, schemaFields, record, model, callback) {

    var fieldsets = {};

    async.eachSeries(Object.keys(schemaFields), function (fieldName, cb) {

        var field = schemaFields[fieldName],
            fieldDetail = {
                label: field.label || ''
            };

        var title = field.fieldset || 'Summary';
        if (!fieldsets[title]) {
            fieldsets[title] = [];
        }

        var cellRenderer = (cellRenderers[field.type]) ? field.type : mapCellRenderer(field.type);

        cellRenderers[cellRenderer](record[fieldName], record, fieldName, model, function (err, value) {

            if (err) {
                console.log('Encountered error while rendering ' + field.type + ' via cellRenderers from render-overview.js for the field ' + fieldName);
                console.log(err);
                return cb(err);
            }

            fieldDetail.value = value;
            fieldsets[title].push(fieldDetail);

            return cb();
        });

    }, function (err) {

        return callback(err, fieldsets);
    });

};

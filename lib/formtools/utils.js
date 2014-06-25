
var schemaType = exports.schemaType = function (schemaType) {

    // extract the function name from schema type
    // this will extra the value String from SchemaString (the names of the functions within mongoose)
    // these always exist and therefore safer than key.options.type which didn't always exist (i.e. array)
    return schemaType.constructor.name.replace(/Schema/gi, '').toLowerCase();

};

var padWithZero = exports.padWithZero = function (val) {
    return String(val).length < 2 ? '0' + String(val) : val;
};

// get default value for a schema field
exports.getDefaultValue = function (field) {

    var fieldType = schemaType(field);

    if (field.defaultValue !== undefined) {

        if (fieldType === 'array') {
            return field.options.default || null;
        }

        // work out the default value and use it
        if (typeof field.defaultValue !== 'function') {
            return value = field.defaultValue;
        } else if (typeof field.defaultValue === 'function' && fieldType !== 'documentarray') {
            return value = field.defaultValue();
        }

    } else if (field.defaultValue === undefined && fieldType === 'datetime') {

        return (function defaultDate () {
            var d = new Date();
            return d.getFullYear() + '-' +
                    padWithZero(d.getMonth()+1) + '-' +
                    padWithZero(d.getDate()) + 'T' +
                    padWithZero(d.getHours()) + ':' +
                    padWithZero(d.getMinutes()) + ':' +
                    '00.000';
        })();

    }

    return null;
}

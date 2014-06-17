
exports.schemaType = function (schemaType) {

    // extract the function name from schema type
    // this will extra the value String from SchemaString (the names of the functions within mongoose)
    // these always exist and therefore safer than key.options.type which didn't always exist (i.e. array)
    return schemaType.constructor.name.replace(/Schema/gi, '').toLowerCase();

};

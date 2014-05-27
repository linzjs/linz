
exports.clean = function (data, model) {

    // loop over the model and determine if any ref fields need to be nullified
    model.schema.eachPath(function (name, path) {

        if (path.options.ref && data[name] !== undefined && !data[name].length) {
            data[name] = null;
        }

    });

    return data;

};

var async = require('async'),
    linz = require('../../'),
    cellRenderers = require('./renderers-cell');

/**
 * Set unique tabId to each tab in overview.body
 * @param {Array} sections overview body array
 */
function setTabId(sections) {
    sections.forEach(function(section, sectionIndex) {
        if (!Array.isArray(section)) {
            return;
        }

        section.forEach(function(tab, tabIndex) {
            // Replace white space from tab.label with "-", make it lowercase and add the index number at the end.
            // sectionIndex and tabIndex number are added at the end to make the tabID unique in case when more then one tab have the same label (title)
            tab.tabId =
                tab.label.replace(/\s+/g, '-').toLowerCase() +
                '-' +
                sectionIndex +
                '-' +
                tabIndex;
        });
    });
}

/**
 * Return the rendered value of field.
 * @param  {Object}   record Overview record object
 * @param  {Object or String} Field name or Object containing field name and field label
 * @param  {Obect}   model  Model object
 * @param  {Function} cb    Callback function
 * @return {Object}         Return object: { label: '', value: '' }
 */
function renderCell(record, field, model, cb) {
    let fieldName = typeof field === 'object' ? field.fieldName : field,
        renderer =
            model.schema.tree[fieldName] &&
            model.schema.tree[fieldName].ref &&
            linz.api.model.getObjectIdFromRefField(record[fieldName]) instanceof
                linz.mongoose.Types.ObjectId
                ? 'reference'
                : record[fieldName] &&
                  linz.api.model.getObjectIdFromRefField(
                      record[fieldName]
                  ) instanceof linz.mongoose.Types.ObjectId &&
                  linz.mongoose.models[record[fieldName].ref]
                ? 'referenceValue'
                : 'text';

    // Users can supply their own renderer fields (use it if provided).
    (field.renderer || cellRenderers[renderer])(
        record[fieldName],
        record,
        fieldName,
        model,
        function(err, value) {
            if (err) {
                return cb(err);
            }

            return cb(null, {
                label: field.label
                    ? field.label
                    : model.linz.formtools.labels[fieldName],
                value: value,
            });
        }
    );
}

/*
 * Update section.fields to an array of objects with 'label' and 'value' keys. 'label' key should contain the field label and 'value' key should contain the field value.
 * e.g ({ label: '', value: '' })
 * @param  {Object}   record   Overview record object
 * @param  {Object}   model    Model object
 * @param  {Object}   section  Section Object with its label and an array of fields (e.g { label: '', fields: [] })
 * @param  {Function} callback Callback function
 * @return {[object]}          Return object: { label: '', fields: [ { label: '', value: '' }, ... ] } to callback
 */
function renderFields(req, res, record, model, section, callback) {
    // filter out invalid fields from section
    var fields = section.fields.filter(function(field) {
        if (typeof field.value === 'function') {
            return field.label;
        }

        // Dynamically build the object.
        if (typeof field !== 'object') {
            return {
                label: model.linz.formtools.labels[field],
                value: record[field],
            };
        }

        return field.fieldName;
    });

    async.mapSeries(
        fields,
        function(field, cb) {
            if (typeof field.value === 'function') {
                return field.value(
                    req,
                    res,
                    record,
                    model,
                    (fieldValueErr, result) => {
                        if (fieldValueErr) {
                            return cb(fieldValueErr);
                        }

                        return cb(null, {
                            label: field.label,
                            value: result,
                        });
                    }
                );
            }

            return renderCell(record, field, model, cb);
        },
        function(err, result) {
            return callback(err, { label: section.label, fields: result });
        }
    );
}

/**
 * Recursively loops through provided section to:
 * (1) Render body if section.body is a function (e.g. { label: '', body: '' })
 * (2) Populate field labels, if section.fields is defined (by converting section.fields into an array of objects. e.g. { label: '', fields: [ { label: '', value: '' }, ... ] })
 * (3) If section.body is an array, recursively repeats step (1) and (2) (e.g. { label: '', body: [] })
 * @param  {[Object]}   req    Request object
 * @param  {[Object]}   res    Response onject
 * @param  {[Object]}   record Overview record
 * @param  {[Object]}   model  Model object
 * @param  {Object or Array}   section from overview body array which can be an Array or an Object
 * @param  {Function} cb       Callback function
 * @return {Array}             returns an Array of objects
 */
function getSections(req, res, record, model, section, labelRequired, cb) {
    if (typeof section === 'function') {
        return section(req, res, record, model, (err, html) => cb(err, html));
    }

    if (typeof section.body === 'function') {
        return section.body(req, res, record, model, function(err, html) {
            if (err) {
                return cb(err);
            }

            return cb(null, { label: section.label, body: html });
        });
    }

    if (Array.isArray(section.body)) {
        // label is not must for sections inside tab. Hence, passing false value for labelRequired argument of getSections
        return getSections(
            req,
            res,
            record,
            model,
            section.body,
            false,
            function(err, result) {
                if (err) {
                    return cb(err);
                }

                // result is an Array of objects. Objects can be in one of the following structure:
                // [ { label: '', body: ''} ]
                // [ { label: '', body: [] } ]
                // [ { label: '', fields: [ { label: '', value: '' }, ... ]} ]
                return cb(null, { label: section.label, body: result });
            }
        );
    }

    if (Array.isArray(section.fields) && section.fields.length) {
        // return an Object (e.g. { label: '', fields: [ { label: '', value: '' }, ... ]})
        return renderFields(req, res, record, model, section, cb);
    }

    if (!Array.isArray(section) || !section.length) {
        return cb();
    }

    async.mapSeries(
        section,
        function(obj, callback) {
            // each object (each tabs) in array section of overview body DSL must have label
            // however, label is optional for sections inside tab
            if (labelRequired && !obj.label) {
                return cb(
                    new Error(
                        'One of the label is missing in overview of ' +
                            model.modelName +
                            ' model.'
                    )
                );
            }

            // recursively goes over nested section which can have repeated object structures
            return getSections(req, res, record, model, obj, true, callback);
        },
        cb
    );
}

/*
 * Get the overview body for a record.
 * Retuns a string of HTML or an array of objects.
 * e.g.
 * (1) 'html content'
 * (2) [ { label: '', body: '' }, { label: '', fields: [] }, { label: ''; body: [] } ]
 * @param  {Object}   req      Request object
 * @param  {Object}   res      Response object
 * @param  {Object}   record   Overview record object
 * @param  {Object}   model    Model object
 * @param  {Function} cb       Callback function
 * @return {String or Array}   Returns a string of HTML or returns an array
 */
function body(req, res, record, model, cb) {
    var overview = model.linz.formtools.overview;

    if (typeof overview.body === 'function') {
        // return a string of HTML content
        return overview.body(req, res, record, model, cb);
    }

    // Since overview.body is not a function, than it must be an Array.
    async.mapSeries(
        overview.body,
        function(section, callback) {
            // Skip if the section is an array or function.
            const requiresLabel =
                !Array.isArray(section) && typeof section !== 'function';

            // each section object in overview body DSL must have label.
            if (requiresLabel && !section.label) {
                return cb(
                    new Error(
                        'One of the label is missing in overview of ' +
                            model.modelName +
                            ' model.'
                    )
                );
            }

            // returns an array of objects
            return getSections(
                req,
                res,
                record,
                model,
                section,
                true,
                callback
            );
        },
        cb
    );
}

module.exports = {
    body: body,
    setTabId: setTabId,
};

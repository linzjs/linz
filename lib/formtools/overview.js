
var async = require('async'),
    cellRenderers = require('./renderers-cell');

/**
 * Set unique tabId to each tab in overview.body
 * @param {Array} overviewBody overview body
 */
function setTabId (overviewBody) {

    overviewBody.forEach(function (section, sectionIndex) {

        if (Array.isArray(section)) {

            section.forEach(function (tab, tabIndex) {

                // Replace white space from tab.lable with "-", make it lowecase and add the index number at the end.
                // sectionIndex and tabIndex number are added at the end to make the tabID unique in case when more then one tab have the same label (title)
                tab.tabId = (tab.label).replace(/\s+/g, '-').toLowerCase() + '-' + sectionIndex + '-' + tabIndex;

            });
        }
    });

}

/*
 * Replace each field name in section of overview.body with object containing field label and filed value
 * e.g ({ label: '', value: '' })
 * @param  {Object}   record   Overview record object
 * @param  {Object}   model    Model object
 * @param  {Object}   section  Section Object with its label and an array of fileds (e.g { label: '', fields: [] })
 * @param  {Function} callback Callback function
 * @return {[object]}          Return object: { label: '', fields: [ { label: '', value: '' }, ... ] } to callback
 */
function renderFields(record, model, section, callback) {

    var fieldset = {
        label: section.label,
        fields: []
    };

    async.eachSeries(section.fields, function (field, cb) {

        var formField = model.linz.formtools.form[field],
            renderer = cellRenderers[formField.type] ? formField.type : 'text';

        cellRenderers[renderer](record[field], record, field, model, function (err, value) {

            if (err) {
                return cb(err);
            }

            fieldset.fields.push({
                label: model.linz.formtools.labels[field],
                value: value
            });

            return cb();

        });

    }, function (err) {
        return callback(err, fieldset);
    });

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
 * @param  {Object or Array}   section from overvie DSL which can be an Array or an Object
 * @param  {Function} cb       Callback function
 * @return {Array}             returns an Array of objects
 */
function getSections (req, res, record, model, section, cb) {

    if (typeof section.body === 'function') {

        return section.body(req, res, record, model, function(err, html) {

            if (err) {
                return cb(err);
            }

            return cb(null, { label: section.label, body: html });

        });

    }

    if (Array.isArray(section.body)) {

        // return an Array of objects, e.g
        // [ { label: '', body: ''} ]
        // [ { label: '', body: [] } ]
        // [ { label: '', fields: [ { label: '', value: '' }, ... ]} ]
        return getSections(req, res, record, model, section.body, function (err, result) {

            if (err) {
                return cb(err);
            }

            return cb(null, { label: section.label, body: result });

        });

    }

    if (Array.isArray(section.fields) && section.fields.length) {

        // return an Object (e.g. { label: '', fields: [ { label: '', value: '' }, ... ]})
        return renderFields(record, model, section, cb);

    }

    if (!Array.isArray(section) || !section.length) {
        return cb();
    }

    async.mapSeries(section, function (obj, callback) {

        // each object (each tabs) in array section of overview body DSL must have label
        if (!obj.label) {
            return cb(new Error('Label is required for each section in overview body.'));
        }

        // recursively goes over nested section which can have repeated object structures
        return getSections(req, res, record, model, obj, callback);

    }, cb);

}

/*
 * Get the overview body for record.
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
function body (req, res, record, model, cb) {

    var overview = model.linz.formtools.overview;

    if (typeof overview.body === 'function') {

        // return a string of HTML content
        return overview.body(req, res, record, model, cb);

    }

    // Since overview.body is not a function, than it must be an Array.
    async.mapSeries(overview.body, function (section, callback) {

        // each section object in overview body DSL must have label.
        if (!Array.isArray(section) && !section.label) {
            return cb(new Error('Label is required for each section in overview body.'));
        }

        // returns an array of objects
        return getSections(req, res, record, model, section, callback);

    }, cb);

}

module.exports = {
    body: body,
    setTabId: setTabId
};

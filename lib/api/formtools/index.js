'use strict';

const actions = require('./actions');
const async = require('async');
const list = require('./list');
const linz = require('../../../');
const parseForm = require('./parse-form');

/**
 * Given `req`, add the form DSL to `req`.
 * @param {Object} req A HTTP request object.
 */
const namespaceForm = (req, form) => new Promise((resolve, reject) => {

    // If we have the form, we don't need to retrieve it.
    if (form) {

        req.linz.model.linz.formtools.form = form;

        return resolve(form);

    }

    return linz.api.model.form(req, req.linz.model.modelName, (err, decoratedForm) => {

        if (err) {
            reject(err);
        }

        req.linz.model.linz.formtools.form = decoratedForm;

        return resolve(decoratedForm);

    });

});

/**
 * Given a `req`, add the list DSL to `req`.
 * @param {Object} req A HTTP request object.
 */
const namespaceList = (req) => new Promise((resolve, reject) => {

    linz.api.model.list(req, req.linz.model.modelName, function(err, list) {

        if (err) {
            return reject(err);
        }

        req.linz.model.linz.formtools.list = list;

        return resolve(list);

    });

});

/**
 * Given a `req`, add the overview DSL to `req`.
 * @param {Object} req A HTTP request object.
 */
const namespaceOverview = (req) => new Promise((resolve, reject) => {

    linz.api.model.overview(req, req.linz.model.modelName, function(err, overview) {

        if (err) {
            return reject(err);
        }

        req.linz.model.linz.formtools.overview = overview;

        return resolve(overview);

    });

});

/**
 * Given a `req` object, and form DSL, decorate any document array fields.
 * @param {Object} req A HTTP request object.
 * @param {Object} form Linz form DSL.
 */
const decorateDocumentArrayFields = (req, form) => new Promise((resolve, reject) => {

    // loop through each of the keys to determine if we have an embedded document
    // if we do, we need to call getForm with the user
    async.forEachOf(form, function(field, key, callback) {

        // if field is not of type documentarray or if it is, it's not implementing the embedded document plugin, exit
        // if (field.type !== 'documentarray') {
        if (field.type !== 'documentarray' || !field.schema.statics.getForm) {
            return callback();
        }

        // Setup the placeholder for the embedded document. Retrieve the labels.
        field.linz = {
            formtools: {
                labels: field.schema.statics.getLabels()
            }
        };

        // Retrieve the form.
        field.schema.statics.getForm(req, function(err, embeddedForm) {

            if (embeddedForm) {
                field.linz.formtools.form = embeddedForm;
            }

            return callback(err);

        });

    }, (err) => {

        if (err) {
            return reject(err);
        }

        return resolve(form);

    });

});

module.exports = {
    actions,
    decorateDocumentArrayFields,
    list,
    namespaceForm,
    namespaceList,
    namespaceOverview,
    parseForm,
};

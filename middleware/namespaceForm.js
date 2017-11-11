'use strict';

const linz = require('../');
const async = require('async');

// This namespace will by used by Linz.
module.exports = function linzNamespaceForm (req, res, next) {

    // Setup the shared formtools data for this particular request.
    async.parallel([

        function(cb) {

            linz.api.model.form(req.user, req.linz.model.modelName, function(err, form) {

                if (err) {
                    return cb(err);
                }

                req.linz.model.linz.formtools.form = form;

                return cb(null);

            });

        },

        function(cb) {

            // loop through each of the keys to determine if we have an embedded document
            // if we do, we need to call getForm with the user
            var form = req.linz.model.linz.formtools.form;

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
                field.schema.statics.getForm(req.user, function(err, embeddedForm) {

                    if (embeddedForm) {
                        field.linz.formtools.form = embeddedForm;
                    }

                    return callback(err);

                });

            }, cb);

        }

    ], next);

}

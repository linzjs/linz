var linz = require('../'),
    async = require('async'),
    utils = require('../lib/utils'),
    formUtils = require('../lib/formtools/utils');

/* GET /admin/config/:config/overview */
var route = function (req, res, next) {

    async.waterfall([

        function (cb) {

            req.linz.config.schema.statics.getForm(function(err,form){

                // retrieve form information, for use in next function
                req.linz.config.form = form;

                // we're done
                return cb(null, form);

            });

        },

        function (form, cb) {


            var db  = linz.mongoose.connection.db;

            db.collection(linz.get('configs collection name'), function (err, collection) {

                var record = {};

                // loop over each key in the body
                // update each field passed to us (as long as its from the schema)
                Object.keys(req.linz.config.schema.paths).forEach(function (field) {

                    if (field !== '_id' && req.body[field] !== undefined) {

                        // merge edit object back into form object (overrides)
                        utils.merge(form[field], form[field]['edit'] || {});

                        if (formUtils.schemaType(req.linz.config.schema.paths[field]) === 'documentarray') {

                            // turn the json into an object, so that we can loop over it
                            var documents = JSON.parse(req.body[field]);

                            // clear the array as we'll push new documents in every time
                            record[field] = [];

                            // loop over each document, apply defaults and push into the array
                            documents.forEach(function (doc) {

                                // loop through each field in the embedded document schema
                                req.linz.config.schema.paths[field].schema.eachPath(function (fieldName, field) {

                                    // if the field hasn't come through the form, apply the default
                                    if (doc[fieldName] === undefined) {
                                        doc[fieldName] = linz.formtools.utils.getDefaultValue(field);
                                    }

                                });

                                // push the new object (complete with defaults) into the array
                                record[field].push(doc);

                            });


                        } else {

                            // handle type conversion here
                            if (form[field].type === 'array' && typeof req.body[field] === 'string') {
                                req.body[field] = [req.body[field]];
                            }

                            // handle booleans
                            if (form[field].type === 'boolean') {
                                req.body[field] = utils.asBoolean(req.body[field]);
                            }

                            // go through the transform function if one exists
                            record[field] = (form[field].transform) ? form[field].transform(req.body[field], 'beforeSave') : req.body[field];

                        }

                    }

                });

                // update system required data
                record.modifiedBy = req.user._id;
                record.dateModified = new Date();

                collection.update({ _id: req.params.config }, {$set: record}, {w:1}, function(err, result) {

                    record._id = req.params.config;

                    // update linz with changes to this config
                    linz.get('configs')[req.params.config].config = record;

                    return cb(err);
                });

            });

        }

    ], function (err) {

        if (err) {
            return next(err);
        }

        return res.redirect(linz.api.admin.getAdminLink(req.linz.config, 'overview', req.params.config));

    });

};

module.exports = route;

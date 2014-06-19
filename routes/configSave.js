var formist = require('formist'),
	linz = require('../'),
    model = require('../lib/formtools/model'),
    async = require('async'),
    utils = require('../lib/utils'),
    formUtils = require('../lib/formtools/utils');

/* GET /admin/:model/:id/overview */
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


            var db  = req.linz.mongoose.connection.db;

            db.collection('linzconfigs', function (err, collection) {

                var record = {};

                // loop over each key in the body
                // update each field passed to us (as long as its from the schema)
                Object.keys(req.linz.config.schema.paths).forEach(function (field) {

                    if (field !== '_id' && req.body[field] !== undefined) {

                        // merge edit object back into form object (overrides)
                        utils.merge(form[field], form[field]['edit'] || {});

                        if (formUtils.schemaType(req.linz.config.schema.paths[field]) === 'documentarray') {

                            // turn the json into an object
                            req.body[field] = JSON.parse(req.body[field]);

                        }

                        // go through the transform function if one exists
                        record[field] = (form[field].transform) ? form[field].transform(req.body[field], 'beforeSave') : req.body[field];

                    }

                });

                record.modifiedBy = req.user._id;

                collection.update({ _id: req.params.config }, {$set: record}, {w:1}, function(err, result) {
                    return cb(err);
                });

            });

        }

    ], function (err) {

        if (err) {
            return next(err);
        }

        return res.redirect(linz.api.getAdminLink(req.linz.config, 'overview', req.params.config));

    });

};

module.exports = route;

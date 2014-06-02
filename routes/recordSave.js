var formist = require('formist'),
	linz = require('../'),
    model = require('../lib/formtools/model'),
    async = require('async'),
    utils = require('../lib/utils');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    async.waterfall([

        function (done) {

            req.linz.model.getForm(function(err,form){

                // retrieve form information, for use in next function
                req.linz.model.form = form;

                // we're done
                return done(null, form);

            });

        },

        function (form, done) {

            req.linz.model.findById(req.params.id).exec(function (err, record) {

                if (err) {
                    return next(err);
                }

                // clean the body
                model.clean(req.body, req.linz.model);

                // loop over each key in the body
                // update each field passed to us (as long as its from the schema)
                Object.keys(req.linz.model.schema.paths).forEach(function (field) {

                    if (field !== '_id' && req.body[field] !== undefined) {

                        // merge edit object back into form object (overrides)
                        utils.merge(form[field], form[field]['edit'] || {});

                        // go through the transform function if one exists
                        record[field] = (form[field].transform) ? form[field].transform(req.body[field], 'beforeSave') : req.body[field];
                    }

                });

                record.save(req, done);

            });

        }

    ], function (err, updatedDocument) {

        if (err) {
            return next(err);
        }

        return res.redirect(linz.api.getAdminLink(req.linz.model.modelName, 'overview', updatedDocument._id));

    });

};

module.exports = route;

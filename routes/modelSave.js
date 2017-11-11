var linz = require('../'),
    model = require('../lib/formtools/model'),
    async = require('async'),
    utils = require('../lib/utils'),
    formUtils = require('../lib/formtools/utils');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    async.waterfall([

        function (done) {

            req.linz.model.getForm(req, function (err, form) {

                // retrieve form information, for use in next function
                req.linz.model.form = form;

                // we're done
                return done(null, form);

            });

        },

        function (form, done) {

            // clean the body
            model.clean(req.body, req.linz.model);

            // loop over each key in the body
            // update each field passed to us (as long as its from the schema)
            Object.keys(req.linz.model.schema.paths).forEach(function (field) {

                if (field !== '_id' && req.body[field] !== undefined) {

                    // merge create object back into form object (overrides)
                    utils.merge(form[field], form[field]['create'] || {});

                    if (formUtils.schemaType(req.linz.model.schema.paths[field]) === 'documentarray') {

                        // turn the json into an object
                        req.body[field] = JSON.parse(req.body[field]);

                    }

                    if (form[field].transform) {

                        req.body[field] = form[field].transform(req.body[field], 'beforeSave', req.body, req.user);

                    }

                }

            });

            return done(null, req.body);

        }


    ], function (err, newModel) {

        if (err) {
            return next(err);
        }

        var m = new req.linz.model(newModel);

        m.save(req, function (err, doc) {

            if (err) {
                return next(err);
            }

            return res.redirect(linz.api.url.getAdminLink(req.linz.model, 'overview', doc._id));

        });

    });

};

module.exports = route;

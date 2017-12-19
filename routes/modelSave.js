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
            const data = model.clean(req.body, req.linz.model);

            // loop over each key in the body
            // update each field passed to us (as long as its from the schema)
            Object.keys(req.linz.model.schema.paths).forEach(function (field) {

                if (field !== '_id' && data[field] !== undefined) {

                    // merge create object back into form object (overrides)
                    utils.merge(form[field], form[field]['create'] || {});

                    if (formUtils.schemaType(req.linz.model.schema.paths[field]) === 'documentarray') {

                        // turn the json into an object
                        data[field] = JSON.parse(data[field]);

                    }

                    // Support widget transform functions, if they exist.
                    // These allow widgets to manipulate a value in a form, ready for saving to the database.
                    if (req.linz.model.linz.formtools.form[field].widget
                        && req.linz.model.linz.formtools.form[field].widget
                        && req.linz.model.linz.formtools.form[field].widget.transform
                        && typeof req.linz.model.linz.formtools.form[field].widget.transform === 'function') {

                        // Pass through name, field, value and form.
                        data[field] = req.linz.model.linz.formtools.form[field].widget.transform(field, req.linz.model.schema.paths[field], data[field], data);

                    }

                    if (form[field].transform) {

                        data[field] = form[field].transform(data[field], 'beforeSave', data, req.user);

                    }

                }

            });

            return done(null, data);

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

var formist = require('formist'),
	linz = require('../'),
    model = require('../lib/formtools/model'),
    async = require('async'),
    utils = require('../lib/utils'),
    formUtils = require('../lib/formtools/utils');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    async.waterfall([

        function (done) {

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
                        utils.merge(req.linz.model.linz.formtools.form[field], req.linz.model.linz.formtools.form[field]['edit'] || {});

                        if (formUtils.schemaType(req.linz.model.schema.paths[field]) === 'documentarray') {

                            // turn the json into an object
                            req.body[field] = JSON.parse(req.body[field]);

                        }

                        // Support widget transform functions, if they exist.
                        // These allow widgets to manipulate a value in a form, ready for saving to the database.
                        if (req.linz.model.linz.formtools.form[field].widget
                            && req.linz.model.linz.formtools.form[field].widget
                            && req.linz.model.linz.formtools.form[field].widget.transform
                            && typeof req.linz.model.linz.formtools.form[field].widget.transform === 'function') {

                            // Pass through name, field, value and form.
                            req.body[field] = req.linz.model.linz.formtools.form[field].widget.transform(field, req.linz.model.schema.paths[field], req.body[field], req.body);

                        }

                        // go through the transform function if one exists
                        record[field] = (req.linz.model.linz.formtools.form[field].transform) ? req.linz.model.linz.formtools.form[field].transform(req.body[field], 'beforeSave', req.body, req.user) : req.body[field];

                    }

                });

                record.save(req, done);

            });

        }

    ], function (err, updatedDocument) {

        if (err) {
            return next(err);
        }

        return res.redirect(linz.api.url.getAdminLink(req.linz.model, 'overview', updatedDocument._id));

    });

};

module.exports = route;

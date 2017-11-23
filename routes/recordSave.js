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

                // Skip to a 404 page.
                if (!record) {
                    return next();
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

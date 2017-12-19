'use strict';

const formist = require('formist');
const linz = require('../');
const model = require('../lib/formtools/model');
const async = require('async');
const utils = require('../lib/utils');
const formUtils = require('../lib/formtools/utils');

/* GET /admin/:model/:id/overview */
const route = (req, res, next) => {

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
                const data = model.clean(req.body, req.linz.model);

                // loop over each key in the body
                // update each field passed to us (as long as its from the schema)
                Object.keys(req.linz.model.schema.paths).forEach(function (field) {

                    if (field !== '_id' && data && data[field] !== undefined && req.linz.model.linz.formtools.form) {

                        // merge edit object back into form object (overrides)
                        utils.merge(req.linz.model.linz.formtools.form[field], req.linz.model.linz.formtools.form[field]['edit'] || {});

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

                        // go through the transform function if one exists
                        record[field] = (req.linz.model.linz.formtools.form[field].transform) ? req.linz.model.linz.formtools.form[field].transform(data[field], 'beforeSave', data, req.user) : data[field];

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

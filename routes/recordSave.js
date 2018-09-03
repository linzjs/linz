'use strict';

const linz = require('../');
const modelHelpers = require('../lib/formtools/model');
const async = require('async');

/* GET /admin/:model/:id/overview */
const route = (req, res, next) => {

    async.waterfall([

        function (done) {

            const { model } = req.linz;
            const { form } = req.linz.model;

            const data = modelHelpers.clean(req.body, req.linz.model);

            linz.api.formtools.parseForm(model, data, form, { formType: 'edit' })
                .then((record) => {

                    req.linz.model.findById(req.params.id).exec((err, doc) => {

                        if (err) {
                            return next(err);
                        }

                        // Skip to a 404 page.
                        if (!doc) {
                            return next();
                        }

                        doc.set(record);

                        doc.save(req, done);

                    });

                })
                .catch(done);

        }

    ], function (err, updatedDocument) {

        if (err) {
            return next(err);
        }

        return res.redirect(linz.api.url.getAdminLink(req.linz.model, 'overview', updatedDocument._id));

    });

};

module.exports = route;

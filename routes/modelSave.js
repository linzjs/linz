'use strict';

const linz = require('../');
const modelHelpers = require('../lib/formtools/model');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    const { model } = req.linz;
    const { form } = req.linz.model;

    // clean the body
    const data = modelHelpers.clean(req.body, model);

    linz.api.formtools.parseForm(model, data, form, { formType: 'create' })
        .then((record) => {

            const doc = new req.linz.model();

            doc.set(record);

            doc.save(req, function (err, doc) {

                if (err) {
                    return next(err);
                }

                return res.redirect(linz.api.url.getAdminLink(model, 'overview', doc._id));

            });

        })
        .catch(done);

};

module.exports = route;

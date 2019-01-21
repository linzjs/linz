'use strict';

const linz = require('../');
const modelHelpers = require('../lib/formtools/model');

/* GET /admin/:model/:id/overview */
const route = (req, res, next) => {

    const { model } = req.linz;
    const { form } = model;

    const data = modelHelpers.clean(req.body, req.linz.model);

    linz.api.formtools.parseForm(model, req, form, {
        data,
        formType: 'edit',
    })
        .then((record) => {

            return req.linz.model.findById(req.params.id).exec()
                .then((doc) => {

                    doc.set(record);

                    return doc.save(req);

                });

        })
        .then(doc => res.redirect(linz.api.url.getAdminLink(req.linz.model, 'overview', doc._id)))
        .catch(next);

};

module.exports = route;

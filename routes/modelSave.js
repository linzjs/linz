'use strict';

const linz = require('../');
const modelHelpers = require('../lib/formtools/model');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    const { model } = req.linz;
    const { form } = model;

    // clean the body
    const data = modelHelpers.clean(req.body, model);

    linz.api.formtools.parseForm(model, req, form, {
        data,
        formType: 'create',
    })
        .then((record) => {

            const doc = new req.linz.model();

            doc.set(record);

            return doc.save(req);

        })
        .then(doc => res.redirect(linz.api.url.getAdminLink(model, 'overview', doc._id)))
        .catch(next);

};

module.exports = route;

var linz = require('../'),
    model = require('../lib/formtools/model'),
    utils = require('../lib/utils'),
    formUtils = require('../lib/formtools/utils');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    const { form } = req.linz.model;

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

            // Support widget transform functions, if they exist.
            // These allow widgets to manipulate a value in a form, ready for saving to the database.
            if (req.linz.model.linz.formtools.form[field].widget
                && req.linz.model.linz.formtools.form[field].widget
                && req.linz.model.linz.formtools.form[field].widget.transform
                && typeof req.linz.model.linz.formtools.form[field].widget.transform === 'function') {

                // Pass through name, field, value and form.
                req.body[field] = req.linz.model.linz.formtools.form[field].widget.transform(field, req.linz.model.schema.paths[field], req.body[field], req.body);

            }

            if (form[field].transform) {

                req.body[field] = form[field].transform(req.body[field], 'beforeSave', req.body, req.user);

            }

        }

    });

    var m = new req.linz.model(req.body);

    m.save(req, function (err, doc) {

        if (err) {
            return next(err);
        }

        return res.redirect(linz.api.url.getAdminLink(req.linz.model, 'overview', doc._id));

    });

};

module.exports = route;

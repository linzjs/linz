var formist = require('formist'),
	linz = require('../'),
    model = require('../lib/formtools/model');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

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
                record[field] = req.body[field];
            }

        });

        record.save(req, function (saveError, updatedDocument) {

            if (saveError) {
                return next(saveError);
            }

            return res.redirect(linz.api.getAdminLink(req.linz.model.modelName, 'overview', updatedDocument._id));

        });

    });

};

module.exports = route;

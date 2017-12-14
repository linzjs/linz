
/* GET /admin/:model/:id/json */
var route = function (req, res, next) {

    // get doc
    req.linz.model.findOneDocument({
        filter: { _id: req.params.id },
        projection: '*',
    }).exec(function (err, doc) {

        if (err) {
            return next(err);
        }

        // Skip to a 404 page.
        if (!doc) {
            return next();
        }

        res.json(doc);

    });

}

module.exports = route;

/* GET /admin/:model/:id/json */
var route = function(req, res, next) {
    // get doc
    req.linz.model.findById(req.params.id, function(err, doc) {
        if (err) {
            return next(err);
        }

        // Skip to a 404 page.
        if (!doc) {
            return next();
        }

        res.json(doc);
    });
};

module.exports = route;

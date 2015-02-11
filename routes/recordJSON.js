
/* GET /admin/:model/:id/json */
var route = function (req, res, next) {

    req.linz.model = req.linz.get('models')[req.params.model];

    // get doc
    req.linz.model.findById(req.params.id, function (err, doc) {

        if (err) {
            return next(err);
        }

        res.json(doc);

    });

}

module.exports = route;

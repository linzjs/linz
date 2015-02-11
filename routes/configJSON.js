var linz = require('../');

/* GET /admin/config/:config/json */
var route = function (req, res, next) {

    req.linz.config = linz.get('configs')[req.params.config];

    linz.mongoose.connection.db.collection(linz.get('configs collection name'), function (err, collection) {

        collection.findOne({ _id: req.params.config}, function (err, doc) {

            if (err) {
                return next(err);
            }

            return res.json(doc);

        });

    });

}

module.exports = route;

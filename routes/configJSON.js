const linz = require('../');

/* GET /admin/config/:config/json */
const route = async function(req, res, next) {
    const collection = linz.mongoose.connection.db.collection(
        linz.get('configs collection name')
    );

    try {
        const doc = await collection.findOne({
            _id: req.params.config,
        });

        return res.json(doc);
    } catch (findErr) {
        return next(findErr);
    }
};

module.exports = route;

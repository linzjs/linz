const linz = require('../');

module.exports = function() {
    return async function(req, res, next) {
        const { db } = linz.mongoose.connection;
        const collection = db.collection(linz.get('configs collection name'));

        try {
            const doc = await collection.findOne({ _id: req.params.config });

            req.linz.record = doc;

            return next();
        } catch (err) {
            return next(err);
        }
    };
};

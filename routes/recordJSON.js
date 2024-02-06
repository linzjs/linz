/* GET /admin/:model/:id/json */
const route = async (req, res, next) => {
    try {
        const doc = await req.linz.model.findById(req.params.id).exec();

        // Skip to a 404 page.
        if (!doc) {
            return next();
        }

        res.json(doc);
    } catch (err) {
        return next(err);
    }
};

module.exports = route;

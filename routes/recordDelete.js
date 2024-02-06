const linz = require('../');

/* GET /admin/:model/:id/delete */
const route = async function(req, res, next) {
    try {
        const doc = await req.linz.model
            .findOne({ _id: req.linz.record._id })
            .exec();

        // Skip to a 404 page.
        if (!doc) {
            return next();
        }

        if (!doc) {
            return res.redirect(linz.api.url.getAdminLink(req.linz.model));
        }

        await doc.deleteOne();

        return res.redirect(linz.api.url.getAdminLink(req.linz.model));
    } catch (err) {
        return next(err);
    }
};

module.exports = route;

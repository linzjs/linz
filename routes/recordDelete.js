var linz = require('../');

/* GET /admin/:model/:id/delete */
var route = function (req, res, next) {

	req.linz.model.findOne({_id: req.linz.record._id}, function (err, doc) {

        if (err) {
            return next(err);
        }

        // Skip to a 404 page.
        if (!doc) {
            return next();
        }

        if (!doc) {
		  return res.redirect(linz.api.url.getAdminLink(req.linz.model));
        }

        doc.remove(function (removeErr) {

            if (removeErr) {
                return next(removeErr);
            }

            return res.redirect(linz.api.url.getAdminLink(req.linz.model));

        });


	});

};

module.exports = route;

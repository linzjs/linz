
/* GET /admin/:model/:id/delete */
var route = function (req, res) {

	req.linz.model.findOneAndRemove({_id: req.linz.record._id}, function (err, doc) {

		return res.redirect(req.linz.api.getAdminLink(req.linz.model));

	});

};

module.exports = route;

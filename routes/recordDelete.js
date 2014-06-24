
/* GET /admin/:model/:id/delete */
var route = function (req, res, next) {

	req.linz.model.findOne({_id: req.linz.record._id}, function (err, doc) {

        if (err) {
            return next(err);
        }

        if (!doc) {
		  return res.redirect(req.linz.get('admin path') + '/model/' + req.linz.model.modelName + '/list');
        }

        doc.remove(function (removeErr) {

            if (removeErr) {
                return next(removeErr);
            }

            return res.redirect(req.linz.get('admin path') + '/model/' + req.linz.model.modelName + '/list');

        });


	});

};

module.exports = route;


module.exports = function () {

	return function (req, res, next) {

        req.linz.model.getForm(req, function(err, form) {

            req.linz.model.form = form;
            next();

        });

	}

}

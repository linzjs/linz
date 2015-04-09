var util = require('util');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = req.linz.api.model.get(req.params.model);

        req.linz.model.getForm(function(err,form){

            req.linz.model.form = form;
            next();

        });

	}

}

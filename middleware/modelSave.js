var linz = require('../');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = linz.api.model.get(req.params.model);

        req.linz.model.getForm(function(err,form){

            req.linz.model.form = form;
            next();

        });

	}

}

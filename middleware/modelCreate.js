var util = require('util');

module.exports = function (model) {

	return function (req, res, next) {

		req.linz.model = req.linz.get('models')[req.params.model];

        req.linz.model.getForm(function(err,form){

            req.linz.model.form = form;
            next();

        });

	}

}
